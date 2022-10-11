import * as Topgg from "@top-gg/sdk"
import { Client } from "droff"
import { InteractionsHelper } from "droff-interactions"
import {
  addNonParentHelpers,
  CacheStore,
  CacheStoreHelpers,
  NonParentCacheStore,
  NonParentCacheStoreHelpers,
} from "droff/caches/stores"
import { createNonParent } from "droff/caches/stores/memory"
import { Guild } from "droff/types"
import { Collection, Db } from "mongodb"
import * as Rx from "rxjs"
import { CandyGuildContext, InventoryItem } from "./candy/entities"
import * as Caches from "./utils/cache"

export type AllContexts = CacheContext &
  DbContext &
  InteractionsContext &
  ClientContext

export interface CacheContext {
  guildsCache: NonParentCacheStore<Guild> & NonParentCacheStoreHelpers<Guild>
  textChannels: CacheStore<void> & CacheStoreHelpers<void>
}

export const createCacheContext = (
  c: Client
): readonly [CacheContext, Rx.Observable<void>] => {
  const guildsCache = addNonParentHelpers<Guild, NonParentCacheStore<Guild>>(
    createNonParent()
  )
  const [textChannels, textChannels$] = c.cacheFromWatch(
    Caches.textChannelIds(c.fromDispatch)
  )()

  return [{ guildsCache, textChannels }, textChannels$] as const
}

export interface DbContext {
  db: Db
  itemCollection: Collection<InventoryItem>
  guildCtxCollection: Collection<CandyGuildContext>
}

export const createDbContext = (db: Db): DbContext => ({
  db,
  itemCollection: db.collection("items"),
  guildCtxCollection: db.collection("candy-guild-contexts"),
  // votesCollection: db.collection("votes"),
})

export interface InteractionsContext {
  ix: InteractionsHelper
}

export interface ClientContext {
  client: Client
}

export interface TopggContext {
  topgg: Topgg.Api
}
