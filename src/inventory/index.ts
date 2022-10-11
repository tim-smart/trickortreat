import * as Rx from "rxjs"
import { ClientContext, DbContext, InteractionsContext } from "../contexts"
import * as Commands from "./interactions/candy"

export const register = (
  ctx: ClientContext & InteractionsContext & DbContext
) => {
  return Rx.merge(Commands.register(ctx))
}
