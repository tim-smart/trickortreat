import { Cache, Permissions } from "droff-helpers"
import * as Channels from "droff/caches/channels"
import { ChannelType, PermissionFlag } from "droff/types"
import { flow, pipe } from "fp-ts/lib/function"
import * as RTE from "fp-ts/ReaderTaskEither"
import * as TE from "fp-ts/TaskEither"
import * as RxO from "rxjs/operators"
import { CacheContext } from "../contexts"

const applyOverwritesWithSend = Permissions.applyOverwrites(
  PermissionFlag.SEND_MESSAGES
)
const canSendMessages = Permissions.has(PermissionFlag.SEND_MESSAGES)

export const textChannelIds = flow(
  Channels.watch$,
  RxO.map(Cache.filterWatch((c) => c.type === ChannelType.GUILD_TEXT)),
  RxO.map((op) => {
    const guildId = op.parentId!

    return pipe(
      op,
      Cache.filterWatch((c) => {
        const everyoneOverwrites = (c.permission_overwrites || []).filter(
          (o) => o.id === guildId
        )
        const permissions = applyOverwritesWithSend(everyoneOverwrites)
        return canSendMessages(permissions)
      })
    )
  }),
  RxO.map(Cache.mapWatch(() => {}))
)

const notFound = RTE.chainNullableK("not found" as unknown)

export const cacheGet = <T>(f: (ctx: CacheContext) => Promise<T | undefined>) =>
  pipe(
    RTE.ask<CacheContext>(),
    RTE.chainTaskEitherK(TE.tryCatchK(f, (reason) => reason)),
    notFound((a) => a)
  )
