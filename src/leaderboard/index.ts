import { DbContext, InteractionsContext } from "../contexts"
import * as Leaderboard from "./interactions/leaderboard"
import * as RxO from "rxjs/operators"

export const register = (ctx: InteractionsContext & DbContext) => {
  return ctx.ix
    .guild(Leaderboard.command)
    .pipe(RxO.mergeMap((x) => Leaderboard.handle(x)(ctx)()))
}
