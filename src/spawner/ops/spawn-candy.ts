import { Snowflake } from "droff/types"
import { pipe } from "fp-ts/lib/function"
import * as RTE from "fp-ts/ReaderTaskEither"
import * as TE from "fp-ts/TaskEither"
import { WithId } from "mongodb"
import { CacheContext, ClientContext } from "../../contexts"
import { Candy, candyFrequencyArray } from "../../inventory/constants"
import { cacheGet } from "../../utils/cache"
import { GuildContext } from "../entities"
import * as CtxRepo from "../repos/guild-contexts"
import * as CalcNext from "./calculate-next-message"
import * as Ui from "../ui/claim"

export type SpawnCandyErr =
  | { _tag: "CacheError"; reason: unknown }
  | { _tag: "SendMessageError"; reason: unknown }

export const run = pipe(
  CtxRepo.thatNeedSpawn,
  RTE.chainW((ctxs) => RTE.sequenceArray(ctxs.map(sendMessageAndUpdateGuild)))
)

const sendMessageAndUpdateGuild = (ctx: WithId<GuildContext>) =>
  pipe(
    getChannelId(ctx),
    RTE.chainFirstW((channelId) =>
      pipe(
        sendMessage(channelId),
        RTE.altW(() => removeChannelId(ctx.guildId, channelId))
      )
    ),
    RTE.chainW(() => CalcNext.run(ctx.guildId)),
    RTE.chainW((nextMessage) => CtxRepo.update(ctx.guildId, nextMessage))
  )

const getChannelId = (ctx: WithId<GuildContext>) =>
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
          client.createMessage(channelId, Ui.message(randomCandy())),
        (reason): SpawnCandyErr => ({
          _tag: "SendMessageError",
          reason,
        })
      )
    )
  )

const randomCandy = (): Candy =>
  candyFrequencyArray[Math.floor(Math.random() * candyFrequencyArray.length)]

const removeChannelId = (guildId: Snowflake, channelId: Snowflake) =>
  pipe(
    RTE.ask<CacheContext>(),
    RTE.map(({ textChannels }) => {
      textChannels.delete(guildId, channelId)
    })
  )
