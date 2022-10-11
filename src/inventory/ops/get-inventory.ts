import { Snowflake } from "droff/types"
import { pipe } from "fp-ts/lib/function"
import * as RTE from "fp-ts/ReaderTaskEither"
import { Inventory } from "../../types"
import { InventoryItem } from "../entities"
import * as ItemRepo from "../repos/items"

export type GetInventoryError = { _tag: "DbError"; reason: unknown }

export const run = (userId: Snowflake) =>
  pipe(
    ItemRepo.forUser(userId),
    RTE.mapLeft(
      (reason): GetInventoryError => ({
        _tag: "DbError",
        reason,
      })
    ),
    RTE.map(inventoryFromItems)
  )

export const inventoryFromItems = (items: InventoryItem[]): Inventory =>
  items.reduce((acc, item) => {
    acc[item.itemId] ??= 0
    acc[item.itemId]++
    return acc
  }, {} as Inventory)
