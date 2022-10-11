import * as Rx from "rxjs"
import { DbContext, InteractionsContext } from "../contexts"
import * as Commands from "./interactions/candy"

export const register = (ctx: InteractionsContext & DbContext) => {
  return Rx.merge(Commands.register(ctx))
}
