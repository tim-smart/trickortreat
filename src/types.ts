import { ReaderTask } from "fp-ts/lib/ReaderTask"
import { ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither"
import { CandyIds } from "./candy/constants"

export type CommandError =
  | { _tag: "RespondError"; reason: unknown }
  | { _tag: "InputError"; option: string; message: string }
  | { _tag: "OpError"; op: string; message: string }

export type CommandErrorTypes = {
  [Tag in CommandError["_tag"]]: Extract<CommandError, { _tag: Tag }>
}

export type CommandOp<C> = ReaderTaskEither<C, CommandError, void>
export type CommandOpTask<C> = ReaderTask<C, void>

// Inventory
export type Inventory = Record<CandyIds, number>
