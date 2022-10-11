import { Ix } from "droff-helpers"
import { InteractionContext } from "droff-interactions"
import { Interaction, InteractionCallbackType, MessageFlag } from "droff/types"
import { sequenceT } from "fp-ts/lib/Apply"
import { pipe } from "fp-ts/lib/function"
import * as O from "fp-ts/Option"
import * as RTE from "fp-ts/ReaderTaskEither"
import * as TE from "fp-ts/TaskEither"
import { ClientContext } from "../../contexts"
import { CommandError } from "../../types"
import { respondOrLogError } from "../../utils/commands"
import { Candy, CandyIds, candyTypeMap } from "../constants"
import * as Op from "../ops/claim"

export const handle = (ctx: InteractionContext) =>
  pipe(
    getCandy(ctx.interaction),
    RTE.fromOption(
      (): CommandError => ({
        _tag: "InputError",
        option: "candy-type",
        message: "That candy no longer exists!",
      })
    ),
    RTE.bindTo("candy"),

    RTE.bind("result", ({ candy }) =>
      pipe(
        Op.run(ctx, candy),
        RTE.mapLeft(
          (e): CommandError => ({
            _tag: "OpError",
            op: "inventory/claim",
            message: JSON.stringify(e),
          })
        )
      )
    ),

    RTE.chainW(({ candy }) => {
      return RTE.sequenceArray([
        removeMessage(ctx.interaction),
        RTE.fromTaskEither(sendFollowUp(ctx, candy)),
      ])
    }),
    RTE.map(() => {}),

    RTE.getOrElse((e) => () => respondOrLogError(ctx)(e))
  )

const removeMessage = ({ message, channel_id }: Interaction) =>
  pipe(
    RTE.ask<ClientContext>(),
    RTE.chainTaskEitherK(
      TE.tryCatchK(
        ({ client }) => client.deleteMessage(channel_id!, message!.id),
        (reason): CommandError => ({
          _tag: "ApiError",
          reason,
          message: "Could not remove candy message",
        })
      )
    ),
    RTE.map(() => {})
  )

const sendFollowUp = ({ respond }: InteractionContext, candy: Candy) =>
  TE.tryCatch(
    () =>
      respond(InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE)({
        content: `You claimed the ${candy.name}, worth ${candy.sugar} sugar points!
        
Use **/candy inventory** to see your stockpile.`,
        flags: MessageFlag.EPHEMERAL,
      }),
    (reason): CommandError => ({
      _tag: "RespondError",
      reason,
    })
  )

const getCandy = (i: Interaction) =>
  pipe(
    Ix.getComponentData(i),
    O.chain((data) => {
      const candyId = data.custom_id.split("-").slice(1).join("-")
      return O.fromNullable(candyTypeMap[candyId as CandyIds] as Candy)
    })
  )
