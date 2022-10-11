import { InteractionContext } from "droff-interactions"
import { Candy, CandyIds } from "../constants"
import * as Repo from "../repos/items"

export type ClaimError = { _tag: "CandyNoExists" }

export const run = (ctx: InteractionContext, candyId: CandyIds) =>
  Repo.create(ctx.member!.user!.id, candyId)
