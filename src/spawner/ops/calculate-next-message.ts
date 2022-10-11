import * as DF from "date-fns"
import { Snowflake } from "droff/types"
import { pipe } from "fp-ts/lib/function"
import * as RTE from "fp-ts/ReaderTaskEither"
import { ClientContext } from "../../contexts"
import { cacheGet } from "../../utils/cache"

export type CalculateNextMessageErr =
  | { _tag: "CacheError"; reason: unknown }
  | { _tag: "NoCounts" }

export const run = (guildId: Snowflake) =>
  pipe(
    getGuildWithCounts(guildId),
    RTE.chainNullableK({ _tag: "NoCounts" } as CalculateNextMessageErr)(
      (g) => g.approximate_member_count
    ),
    RTE.map(nextMessageFromMemberCount)
  )

const getGuildWithCounts = (guildId: Snowflake) =>
  pipe(
    RTE.ask<ClientContext>(),
    RTE.chainW(({ client }) =>
      cacheGet(({ guildsCache }) =>
        guildsCache.getOr((id) => client.getGuild(id, { with_counts: true }))(
          guildId
        )
      )
    ),
    RTE.mapLeft(
      (reason): CalculateNextMessageErr => ({
        _tag: "CacheError",
        reason,
      })
    )
  )

const minMinutes = 1
const maxMinutes = 60 * 3

const maxCount = 50000

const nextMessageFromMemberCount = (count: number) => {
  if (count >= maxCount) {
    return DF.addMinutes(Date.now(), minMinutes)
  }

  const countDiff = maxCount - count
  const minutes = Math.round(Math.pow(maxMinutes, countDiff / maxCount))
  return DF.addMinutes(Date.now(), minutes)
}
