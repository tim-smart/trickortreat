import { CacheContext, ClientContext, DbContext } from "../contexts"
import * as Registration from "./rxjs/registration"
import * as Spawner from "./rxjs/spawner"
import * as Rx from "rxjs"

export const register = (ctx: DbContext & CacheContext & ClientContext) => {
  return Rx.merge(Registration.run(ctx), Spawner.run$(ctx))
}
