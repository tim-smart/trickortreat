import { InteractionContext } from "droff-interactions"
import { InteractionCallbackType } from "droff/types"
import { pipe } from "fp-ts/lib/function"
import * as TE from "fp-ts/TaskEither"
import { CommandError } from "../../types"
import { respondOrLogError } from "../../utils/commands"
import { candyTypes } from "../constants"

const choiceSearch = (query: string | undefined) =>
  candyTypes.filter(({ name }) =>
    name.toLowerCase().startsWith(query?.trim().toLowerCase() ?? "")
  )

export const handle = (x: InteractionContext) =>
  pipe(
    TE.tryCatch(
      () =>
        x.respond(
          InteractionCallbackType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT
        )({
          // TODO: Filter by inventory counts
          choices: choiceSearch(x.focusedOption?.value).map(({ id, name }) => ({
            name,
            value: id,
          })),
        }),
      (reason): CommandError => ({
        _tag: "RespondError",
        reason,
      })
    ),
    TE.getOrElse(respondOrLogError(x))
  )
