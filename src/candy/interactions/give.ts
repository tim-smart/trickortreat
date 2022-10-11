import { Ix } from "droff-helpers"
import { InteractionContextWithSubCommand } from "droff-interactions"
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  Interaction,
  MessageFlag,
} from "droff/types"
import * as E from "fp-ts/Either"
import { pipe } from "fp-ts/lib/function"
import * as TE from "fp-ts/TaskEither"
import { CommandError } from "../../types"
import { bindInput, respondOrLogError } from "../../utils/commands"

export const command: ApplicationCommandOption = {
  type: ApplicationCommandOptionType.SUB_COMMAND,
  name: "give",
  description: "Give some of your candy to another user",
  options: [
    {
      type: ApplicationCommandOptionType.USER,
      name: "user",
      description: "Who do you want to give candy to?",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.STRING,
      name: "candy-type",
      description: "What type of candy do you want to give?",
      autocomplete: true,
      required: true,
    },
  ],
}

const getUser = Ix.resolveOptionValue("user", (id, data) => data.users![id])
const getType = Ix.optionValue("candy-type")

const getOpts = (i: Interaction) =>
  pipe(
    E.Do,
    bindInput("user", "missing", getUser(i)),
    bindInput("type", "missing", getType(i))
  )

export const handle = ([x]: InteractionContextWithSubCommand) =>
  pipe(
    getOpts(x.interaction),
    TE.fromEither,
    TE.chain(({ user, type }) =>
      TE.tryCatch(
        () =>
          x.respond(4)({
            content: `Got give ${user.id} ${type}`,
            flags: MessageFlag.EPHEMERAL,
          }),
        (reason): CommandError => ({ _tag: "RespondError", reason })
      )
    ),
    TE.getOrElse(respondOrLogError(x))
  )
