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

export const needMessage = pipe(
  RTE.ask<DbContext>(),
  RTE.chainTaskEitherK(
    TE.tryCatchK(
      ({ guildCtxCollection }) =>
        guildCtxCollection
          .find({
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
            { $set: { nextMessage } },
            { upsert: true }
          ),
        (reason): GuildCtxRepoError => ({
          _tag: "DbError",
          reason,
        })
      )
    )
  )

export const remove = (guildId: Snowflake) =>
  pipe(
    RTE.ask<DbContext>(),
    RTE.chainTaskEitherK(
      TE.tryCatchK(
        ({ guildCtxCollection }) => guildCtxCollection.deleteMany({ guildId }),
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
