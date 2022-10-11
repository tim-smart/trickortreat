import { InteractionContext } from "droff-interactions"
import { Candy } from "../constants"
import * as Repo from "../repos/items"

export type ClaimError = { _tag: "CandyNoExists" }

export const run = (ctx: InteractionContext, candy: Candy) =>
  Repo.create(ctx.member!.user!.id, candy)
