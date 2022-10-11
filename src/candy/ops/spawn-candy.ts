import { Snowflake } from "droff/types"
import { pipe } from "fp-ts/lib/function"
import * as RTE from "fp-ts/ReaderTaskEither"
import * as TE from "fp-ts/TaskEither"
import { WithId } from "mongodb"
import { ClientContext } from "../../contexts"
import { cacheGet } from "../../utils/cache"
import { CandyGuildContext } from "../entities"
import * as CtxRepo from "../repos/guild-contexts"
import * as CalcNext from "./calculate-next-message"

export type SpawnCandyErr =
  | { _tag: "CacheError"; reason: unknown }
  | { _tag: "SendMessageError"; reason: unknown }

export const run = pipe(
  CtxRepo.needMessage,
  RTE.chainW((ctxs) => RTE.sequenceArray(ctxs.map(sendMessageAndUpdateGuild)))
)

const sendMessageAndUpdateGuild = (ctx: WithId<CandyGuildContext>) =>
  pipe(
    getChannelId(ctx),
    RTE.chainW(sendMessage),
    RTE.chainW(() => CalcNext.run(ctx.guildId)),
    RTE.chainW((nextMessage) => CtxRepo.upsert(ctx.guildId, nextMessage))
  )

const getChannelId = (ctx: WithId<CandyGuildContext>) =>
  pipe(
    cacheGet(({ textChannels }) => textChannels.getForParent(ctx.guildId)),
    RTE.mapLeft(
      (reason): SpawnCandyErr => ({
        _tag: "CacheError",
        reason,
      })
    ),
    RTE.map((channels) => {
      const ids = [...channels.keys()]
      return ids[Math.floor(Math.random() * ids.length)] as Snowflake
    })
  )

const sendMessage = (channelId: Snowflake) =>
  pipe(
    RTE.ask<ClientContext>(),
    RTE.chainTaskEitherK(
      TE.tryCatchK(
        ({ client }) =>
          client.createMessage(channelId, {
            // TODO: Add message components and embed
            content: "Candy spawn",
          }),
        (reason): SpawnCandyErr => ({
          _tag: "SendMessageError",
          reason,
        })
      )
    )
  )
