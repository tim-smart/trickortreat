import { InteractionContext } from "droff-interactions"
import { MessageFlag } from "droff/types"
import { pipe } from "fp-ts/lib/function"
import * as E from "fp-ts/lib/Either"
import * as O from "fp-ts/lib/Option"
import * as TE from "fp-ts/lib/TaskEither"
import { CommandError, CommandErrorTypes } from "../types"

const errorMessages: {
  [K in CommandError["_tag"]]: (err: CommandErrorTypes[K]) => string
} = {
  RespondError: (err) => `Could not respond to command: ${err.reason}`,
  InputError: (e) => `Wrong value for ${e.option}, ${e.message}`,
  OpError: (e) => `${e.message} (${e.op})`,
}

export const errorToMessage = (err: CommandError): string =>
  errorMessages[err._tag](err as any)

export const respondOrLogError =
  ({ respond }: InteractionContext) =>
  (err: CommandError) =>
    pipe(
      TE.tryCatch(
        () =>
          respond(4)({
            flags: MessageFlag.EPHEMERAL,
            content: errorToMessage(err),
          }),
        (err) => `Failed to respond with err: ${err}`
      ),
      TE.getOrElse(
        (err) => async () => console.error(`[utils/commands]: ${err}`)
      )
    )

export const bindInput = <K extends string, A, P>(
  name: Exclude<K, keyof P>,
  message: string,
  option: O.Option<A>
) =>
  E.bind<K, P, CommandError, A>(name, () =>
    pipe(
      option,
      E.fromOption(
        (): CommandError => ({
          _tag: "InputError",
          option: name,
          message,
        })
      )
    )
  )
