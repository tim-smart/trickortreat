import { watch$ } from "droff/caches/guilds"
import { Snowflake } from "droff/types"
import { EMPTY } from "rxjs"
import * as RxO from "rxjs/operators"
import { CacheContext, ClientContext, DbContext } from "../../contexts"
import * as Register from "../ops/register-guild"
import * as Remove from "../ops/remove-guild"

export const run = (ctx: ClientContext & DbContext & CacheContext) =>
  watch$(ctx.client.fromDispatch).pipe(
    RxO.mergeMap((op) => {
      if (op.event === "delete") {
        return Remove.run(op.resourceId as Snowflake)(ctx)()
      } else if (op.event === "create") {
        return Register.run(op.resourceId as Snowflake)(ctx)()
      }

      return EMPTY
    }),

    RxO.tap((e) => {
      if (e._tag === "Left") {
        console.error("[spawner/rxjs/registration]", e.left)
      }
    }),

    RxO.ignoreElements()
  )
