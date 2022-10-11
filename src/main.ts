import * as Dotenv from "dotenv"
Dotenv.config()

import * as Ix from "droff-interactions"
import { createClient } from "droff"
import { MongoClient } from "mongodb"
import { AllContexts, createCacheContext, createDbContext } from "./contexts"
import * as Rx from "rxjs"
import * as Inventory from "./inventory"
import * as Spawner from "./spawner"

async function main() {
  const mongo = await MongoClient.connect(process.env.MONGODB_URI!)
  const db = mongo.db(process.env.MONGODB_DB!)

  const client = createClient({
    token: process.env.DISCORD_BOT_TOKEN!,
  })
  const ix = Ix.create(client)
  const [cacheContext, cacheEffects$] = createCacheContext(client)

  const context: AllContexts = {
    ...cacheContext,
    ...createDbContext(db),
    ix,
    client,
  }

  Rx.merge(
    client.effects$,
    ix.sync$,
    cacheEffects$,

    Inventory.register(context),
    Spawner.register(context)
  ).subscribe()
}

main().catch(console.error)
