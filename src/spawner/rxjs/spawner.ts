import * as Rx from "rxjs"
import * as RxO from "rxjs/operators"
import { CacheContext, ClientContext, DbContext } from "../../contexts"
import * as Spawn from "../ops/spawn-candy"
import * as E from "fp-ts/Either"
import { pipe } from "fp-ts/lib/function"

export const run$ = (ctx: DbContext & CacheContext & ClientContext) =>
  Rx.interval(10000).pipe(
    RxO.exhaustMap(() => Spawn.run(ctx)()),
    RxO.map((e) =>
      pipe(
        e,
        E.mapLeft((e) => {
          console.error("[spawner/rxjs/spawner]", e)
        })
      )
    ),
    RxO.ignoreElements()
  )
