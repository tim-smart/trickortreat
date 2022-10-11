import { InteractionContext } from "droff-interactions"
import { InteractionCallbackType } from "droff/types"
import { pipe } from "fp-ts/lib/function"
import * as TE from "fp-ts/TaskEither"
import * as RTE from "fp-ts/ReaderTaskEither"
import { CommandError, Inventory } from "../../types"
import { respondOrLogError } from "../../utils/commands"
import { Candy, CandyIds, candyTypeMap, candyTypes } from "../constants"
import * as Op from "../ops/get-inventory"
import * as Arr from "fp-ts/lib/Array"

const choiceSearch = (query: string | undefined) =>
  Arr.filter(({ name }: Candy) =>
    name.toLowerCase().startsWith(query?.trim().toLowerCase() ?? "")
  )

export const handle = (x: InteractionContext) =>
  pipe(
    Op.run(x.member!.user!.id),
    RTE.mapLeft(
      (e): CommandError => ({
        _tag: "OpError",
        op: "inventory/get-inventory",
        message: "Could not get inventory",
      })
    ),
    RTE.chainTaskEitherK((i) => sendEmbed(x, i)),
    RTE.map(() => {}),
    RTE.getOrElse((e) => () => respondOrLogError(x)(e))
  )

const sendEmbed = (x: InteractionContext, i: Inventory) =>
  TE.tryCatch(
    () =>
      x.respond(
        InteractionCallbackType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT
      )({
        choices: pipe(
          Object.keys(i).map((id) => candyTypeMap[id as CandyIds]),
          choiceSearch(x.focusedOption?.value),
          Arr.map(({ name, id }) => ({
            name: `${name} (${i[id]})`,
            value: id,
          }))
        ),
      }),

    (reason): CommandError => ({
      _tag: "RespondError",
      reason,
    })
  )
