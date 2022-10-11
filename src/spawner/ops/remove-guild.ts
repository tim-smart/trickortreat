import { Snowflake } from "droff/types"
import * as CtxRepo from "../repos/guild-contexts"

export const run = (guildId: Snowflake) => CtxRepo.remove(guildId)
