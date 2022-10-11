import { Snowflake } from "droff/types"
import { ObjectId } from "mongodb"
import { CandyIds } from "./constants"

export interface InventoryItem {
  _id?: ObjectId
  userId: Snowflake
  itemId: CandyIds
}

export interface CandyGuildContext {
  _id?: ObjectId
  guildId: Snowflake
  nextMessage: Date
}
