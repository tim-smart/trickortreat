import { Snowflake } from "droff/types"
import { pipe } from "fp-ts/lib/function"
import * as RTE from "fp-ts/ReaderTaskEither"
import * as CtxRepo from "../repos/guild-contexts"

export const run = (guildId: Snowflake) =>
  pipe(
    CtxRepo.upsert(guildId, new Date()),
    RTE.map(() => {})
  )
