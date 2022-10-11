import { Snowflake } from "droff/types"
import { pipe } from "fp-ts/lib/function"
import * as RTE from "fp-ts/ReaderTaskEither"
import * as TE from "fp-ts/TaskEither"
import { DbContext } from "../../contexts"
import { CandyIds } from "../constants"

export type ItemsRepoErr = { _tag: "DbError"; reason: unknown }

export const forUser = (userId: Snowflake) =>
  pipe(
    RTE.ask<DbContext>(),
    RTE.chainTaskEitherK(({ itemCollection }) =>
      TE.tryCatch(
        () =>
          itemCollection
            .find({
              userId,
            })
            .toArray(),
        (reason) => reason
      )
    )
  )

export const transfer = (
  fromUserId: Snowflake,
  toUserId: Snowflake,
  itemId: CandyIds
) =>
  pipe(
    RTE.ask<DbContext>(),
    RTE.chainTaskEitherK(({ itemCollection }) =>
      TE.tryCatch(
        () =>
          itemCollection.updateOne(
            {
              userId: fromUserId,
              itemId,
            },
            { $set: { userId: toUserId } }
          ),
        (reason) => reason
      )
    )
  )

export const create = (userId: Snowflake, itemId: CandyIds) =>
  pipe(
    RTE.ask<DbContext>(),
    RTE.chainTaskEitherK(({ itemCollection }) =>
      TE.tryCatch(
        () =>
          itemCollection.insertOne({
            userId,
            itemId,
          }),
        (reason): ItemsRepoErr => ({
          _tag: "DbError",
          reason,
        })
      )
    )
  )
