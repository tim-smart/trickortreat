import { Cache } from "droff-helpers"
import * as Channels from "droff/caches/channels"
import { ChannelType } from "droff/types"
import { flow, pipe } from "fp-ts/lib/function"
import * as RTE from "fp-ts/ReaderTaskEither"
import * as TE from "fp-ts/TaskEither"
import * as RxO from "rxjs/operators"
import { CacheContext } from "../contexts"

export const textChannelIds = flow(
  Channels.watch$,
  RxO.map(Cache.filterWatch((c) => c.type === ChannelType.GUILD_TEXT)),
  RxO.map(Cache.mapWatch(() => {}))
)

const notFound = RTE.chainNullableK("not found" as unknown)

export const cacheGet = <T>(f: (ctx: CacheContext) => Promise<T | undefined>) =>
  pipe(
    RTE.ask<CacheContext>(),
    RTE.chainTaskEitherK(TE.tryCatchK(f, (reason) => reason)),
    notFound((a) => a)
  )
