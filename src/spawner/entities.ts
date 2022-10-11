import { Snowflake } from "droff/types"
import { ObjectId } from "mongodb"

export interface GuildContext {
  _id?: ObjectId
  guildId: Snowflake
  nextMessage: Date
}
