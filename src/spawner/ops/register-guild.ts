import { Snowflake } from "droff/types"
import { pipe } from "fp-ts/lib/function"
import * as RTE from "fp-ts/ReaderTaskEither"
import * as CtxRepo from "../repos/guild-contexts"
import * as CalcNext from "./calculate-next-message"

export const run = (guildId: Snowflake) =>
  pipe(
    CtxRepo.exists(guildId),
    RTE.chain((exists) => (exists ? RTE.right(null) : register(guildId))),
    RTE.map(() => {})
  )

const register = (guildId: Snowflake) =>
  pipe(
    CalcNext.run(guildId),
    RTE.chainW((nextMessage) => CtxRepo.upsert(guildId, nextMessage))
  )
