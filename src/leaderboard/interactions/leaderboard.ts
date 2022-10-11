import { InteractionContext } from "droff-interactions"
import { CreateGlobalApplicationCommandParams, MessageFlag } from "droff/types"
import { pipe } from "fp-ts/lib/function"
import * as RTE from "fp-ts/ReaderTaskEither"
import * as TE from "fp-ts/TaskEither"
import * as Repo from "../../inventory/repos/items"
import { CommandError } from "../../types"
import { respondOrLogError } from "../../utils/commands"
import * as Ui from "../ui"

export const command: CreateGlobalApplicationCommandParams = {
  name: "leaderboard",
  description: "See who has the most sugar points",
}

export const handle = (ctx: InteractionContext) =>
  pipe(
    Repo.topUsers,
    RTE.mapLeft(
      (e): CommandError => ({
        _tag: "OpError",
        op: "leaderboard",
        message: `Could not fetch leaderboard: ${e.reason}`,
      })
    ),

    RTE.chainTaskEitherK(
      TE.tryCatchK(
        (users) =>
          ctx.respond(4)({
            embeds: [Ui.embed(users)],
            flags: MessageFlag.EPHEMERAL,
          }),
        (reason): CommandError => ({
          _tag: "RespondError",
          reason,
        })
      )
    ),

    RTE.getOrElse((e) => () => respondOrLogError(ctx)(e))
  )
