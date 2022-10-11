import { Ix } from "droff-helpers"
import { InteractionContextWithSubCommand } from "droff-interactions"
import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  Interaction,
} from "droff/types"
import * as E from "fp-ts/Either"
import { pipe } from "fp-ts/lib/function"
import * as TE from "fp-ts/TaskEither"
import * as RTE from "fp-ts/ReaderTaskEither"
import { CommandError } from "../../types"
import { bindInput, respondOrLogError } from "../../utils/commands"
import { CandyIds, candyTypeMap } from "../constants"
import * as Op from "../ops/give"

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
    RTE.fromEither,

    RTE.chainFirstW(({ user, type }) =>
      pipe(
        Op.run(x.member!.user!.id, user.id, type as CandyIds),
        RTE.mapLeft(
          (e): CommandError => ({
            _tag: "OpError",
            op: "inventory/give",
            message: `Could not give candy (${e})`,
          })
        )
      )
    ),

    RTE.chainTaskEitherK(({ user, type }) =>
      TE.tryCatch(
        () => {
          const candy = candyTypeMap[type as CandyIds]
          return x.respond(4)({
            content: `<@${x.member!.user!.id}> gave <@${user.id}> ${
              candy.prefix
            } ${candy.name}, worth ${candy.sugar} sugar points!`,
          })
        },
        (reason): CommandError => ({ _tag: "RespondError", reason })
      )
    ),
    RTE.getOrElse((e) => () => respondOrLogError(x)(e))
  )
