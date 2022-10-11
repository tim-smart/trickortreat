import * as IxO from "droff-interactions"
import {
  CreateGlobalApplicationCommandParams,
  InteractionType,
} from "droff/types"
import * as Rx from "rxjs"
import * as RxO from "rxjs/operators"
import { DbContext, InteractionsContext } from "../../contexts"
import * as CandyType from "./candy-type"
import * as Give from "./give"
import * as Inventory from "./inventory"

const command: CreateGlobalApplicationCommandParams = {
  name: "candy",
  description: "Manage your stockpile of confectionary",
  options: [Inventory.command, Give.command],
}

export const register = (
  ctx: InteractionsContext & DbContext
): Rx.Observable<void> => {
  const commands = ctx.ix.guild(command).pipe(RxO.share())

  const inventory = commands.pipe(
    IxO.withSubCommand("inventory"),
    RxO.flatMap((a) => Inventory.handle(a)(ctx)())
  )

  const give = commands.pipe(
    IxO.withSubCommand("give"),
    RxO.flatMap((a) => Give.handle(a)())
  )

  const candyAutoComplete = ctx.ix
    .interaction(InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE)
    .pipe(
      IxO.filterByFocusedOption("candy-type"),
      RxO.flatMap((x) => CandyType.handle(x)())
    )

  return Rx.merge(inventory, give, candyAutoComplete)
}
