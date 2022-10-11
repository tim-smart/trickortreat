import { Snowflake } from "droff/types"
import { pipe } from "fp-ts/lib/function"
import * as RTE from "fp-ts/ReaderTaskEither"
import * as TE from "fp-ts/TaskEither"
import { ObjectId } from "mongodb"
import { DbContext } from "../../contexts"
import { Candy, CandyIds } from "../constants"

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

export const create = (userId: Snowflake, candy: Candy) =>
  pipe(
    RTE.ask<DbContext>(),
    RTE.chainTaskEitherK(({ itemCollection }) =>
      TE.tryCatch(
        () =>
          itemCollection.insertOne({
            userId,
            itemId: candy.id,
            points: candy.sugar,
          }),
        (reason): ItemsRepoErr => ({
          _tag: "DbError",
          reason,
        })
      )
    )
  )

export interface TopUser {
  _id: Snowflake
  points: number
}

export const topUsers = pipe(
  RTE.ask<DbContext>(),
  RTE.chainTaskEitherK(({ itemCollection }) =>
    TE.tryCatch(
      () =>
        itemCollection
          .aggregate<TopUser>([
            { $group: { _id: "$userId", points: { $sum: "$points" } } },
          ])
          .sort({ points: -1 })
          .limit(15)
          .toArray(),

      (reason): ItemsRepoErr => ({
        _tag: "DbError",
        reason,
      })
    )
  )
)
