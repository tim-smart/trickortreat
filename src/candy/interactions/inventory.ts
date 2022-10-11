import { InteractionContextWithSubCommand } from "droff-interactions"
import { ApplicationCommandOptionType, MessageFlag } from "droff/types"
import { pipe } from "fp-ts/lib/function"
import * as TE from "fp-ts/TaskEither"
import * as RTE from "fp-ts/ReaderTaskEither"
import { CommandError } from "../../types"
import { respondOrLogError } from "../../utils/commands"
import * as UI from "../ui/inventory"
import * as Op from "../ops/get-inventory"

export const command = {
  type: ApplicationCommandOptionType.SUB_COMMAND,
  name: "inventory",
  description: "See what's in your pile of candy",
}

export const handle = ([x]: InteractionContextWithSubCommand) =>
  pipe(
    Op.run(x.member!.user!.id),
    RTE.mapLeft(
      (): CommandError => ({
        _tag: "OpError",
        op: "get-inventory",
        message: "Could not get your inventory",
      })
    ),
    RTE.chainTaskEitherK(
      TE.tryCatchK(
        (inventory) =>
          x.respond(4)({
            embeds: [UI.embed(inventory)],
            flags: MessageFlag.EPHEMERAL,
          }),
        (reason): CommandError => ({ _tag: "RespondError", reason })
      )
    ),
    RTE.getOrElse((e) => () => respondOrLogError(x)(e))
  )
