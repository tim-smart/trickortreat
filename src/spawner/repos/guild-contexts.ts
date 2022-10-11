import { Snowflake } from "droff/types"
import { identity, pipe } from "fp-ts/lib/function"
import * as RTE from "fp-ts/ReaderTaskEither"
import * as TE from "fp-ts/TaskEither"
import { DbContext } from "../../contexts"

export type GuildCtxRepoError =
  | {
      _tag: "DbError"
      reason: unknown
    }
  | { _tag: "NotFound" }

export const forGuild = (guildId: Snowflake) =>
  pipe(
    RTE.ask<DbContext>(),
    RTE.chainTaskEitherK(
      TE.tryCatchK(
        ({ guildCtxCollection }) =>
          guildCtxCollection.findOne({
            guildId,
          }),
        (reason): GuildCtxRepoError => ({
          _tag: "DbError",
          reason,
        })
      )
    ),
    RTE.chainNullableK({
      _tag: "NotFound",
    } as GuildCtxRepoError)(identity)
  )

export const thatNeedSpawn = pipe(
  RTE.ask<DbContext>(),
  RTE.chainTaskEitherK(
    TE.tryCatchK(
      ({ guildCtxCollection }) =>
        guildCtxCollection
          .find({
            disabled: { $ne: false },
            nextMessage: { $lte: new Date() },
          })
          .toArray(),
      (reason): GuildCtxRepoError => ({
        _tag: "DbError",
        reason,
      })
    )
  )
)

export const upsert = (guildId: Snowflake, nextMessage: Date) =>
  pipe(
    RTE.ask<DbContext>(),
    RTE.chainTaskEitherK(
      TE.tryCatchK(
        ({ guildCtxCollection }) =>
          guildCtxCollection.updateOne(
            { guildId },
            {
              $setOnInsert: { nextMessage },
              $set: { disabled: false },
            },
            { upsert: true }
          ),
        (reason): GuildCtxRepoError => ({
          _tag: "DbError",
          reason,
        })
      )
    )
  )

export const disable = (guildId: Snowflake) =>
  pipe(
    RTE.ask<DbContext>(),
    RTE.chainTaskEitherK(
      TE.tryCatchK(
        ({ guildCtxCollection }) =>
          guildCtxCollection.updateMany(
            { guildId },
            { $set: { disabled: true } }
          ),
        (reason): GuildCtxRepoError => ({
          _tag: "DbError",
          reason,
        })
      )
    )
  )

export const exists = (guildId: Snowflake) =>
  pipe(
    RTE.ask<DbContext>(),
    RTE.chainTaskEitherK(
      TE.tryCatchK(
        ({ guildCtxCollection }) => guildCtxCollection.findOne({ guildId }),
        (reason): GuildCtxRepoError => ({
          _tag: "DbError",
          reason,
        })
      )
    ),
    RTE.map((a) => a !== null)
  )
