import * as IxO from "droff-interactions"
import {
  CreateGlobalApplicationCommandParams,
  InteractionType,
} from "droff/types"
import * as Rx from "rxjs"
import * as RxO from "rxjs/operators"
import { ClientContext, DbContext, InteractionsContext } from "../../contexts"
import * as CandyType from "./candy-type"
import * as Claim from "./claim"
import * as Give from "./give"
import * as Inventory from "./inventory"

const command: CreateGlobalApplicationCommandParams = {
  name: "candy",
  description: "Manage your stockpile of confectionary",
  options: [Inventory.command, Give.command],
}

export const register = (
  ctx: ClientContext & InteractionsContext & DbContext
): Rx.Observable<void> => {
  const commands = ctx.ix.global(command).pipe(RxO.share())

  const inventory = commands.pipe(
    IxO.withSubCommand(Inventory.command.name),
    RxO.flatMap((a) => Inventory.handle(a)(ctx)())
  )

  const give = commands.pipe(
    IxO.withSubCommand(Give.command.name),
    RxO.flatMap((a) => Give.handle(a)(ctx)())
  )

  const candyAutoComplete = ctx.ix
    .interaction(InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE)
    .pipe(
      IxO.filterByFocusedOption("candy-type"),
      RxO.flatMap((x) => CandyType.handle(x)(ctx)())
    )

  const claim = ctx.ix.interaction(InteractionType.MESSAGE_COMPONENT).pipe(
    IxO.customIdStartsWith("claim-"),
    RxO.mergeMap((x) => Claim.handle(x)(ctx)())
  )

  return Rx.merge(inventory, give, candyAutoComplete, claim)
}
