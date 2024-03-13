import {
  createServiceRouter,
  createTRPCProcedure,
} from "@/lib/create-service-router";
import { createTRPCRouter } from "@/lib/trpc/trpc";
import { SyncDbTableName } from "@/schemas";
import { syncAll } from "@/services/sync-all";
import { syncEvents } from "@/services/sync-events";
import { syncRaces } from "@/services/sync-races";
import * as pingServices from "@/services/ping";
export const syncServices = {
  Races: syncRaces,
  Events: syncRaces,
  AthleteResults: syncRaces,
  AthleteSplits: syncRaces,
  Athletes: syncRaces,
  PrimaryCat: syncRaces,
  SecondaryCat: syncRaces,
  Splits: syncRaces,
} satisfies Record<SyncDbTableName, unknown>;

export const serviceRouter = createTRPCRouter({
  sync: createServiceRouter(syncServices),
  syncAll: createTRPCProcedure(syncAll),
  ping: createServiceRouter(pingServices),
});

export type ServiceRouter = typeof serviceRouter;
