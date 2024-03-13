import {
  createServiceRouter,
  createTRPCProcedure,
} from "@/lib/create-service-router";
import { createTRPCRouter } from "@/lib/trpc/trpc";
import { SyncDbTableName } from "@/schemas";
import { syncAll } from "@/services/sync-all";
import { syncEvents } from "@/services/sync/sync-events";
import { syncRaces } from "@/services/sync/sync-races";
import * as pingServices from "@/services/ping";
import { syncPrimaryCategories } from "@/services/sync/sync-primary-category";
import { syncSecondaryCategories } from "@/services/sync/sync-secondary-categories";
import { syncAthletes } from "@/services/sync/sync-athletes";
import { syncSplits } from "@/services/sync/sync-splits";
import { syncAthleteResults } from "@/services/sync/sync-athlete-results";
export const syncServices = {
  Races: syncRaces,
  Events: syncEvents,
  PrimaryCategories: syncPrimaryCategories,
  SecondaryCategories: syncSecondaryCategories,
  AthleteResults: syncAthleteResults,
  AthleteSplits: syncRaces,
  Athletes: syncAthletes,
  Splits: syncSplits,
} satisfies Record<SyncDbTableName, unknown>;

export const serviceRouter = createTRPCRouter({
  sync: createServiceRouter(syncServices),
  syncAll: createTRPCProcedure(syncAll),
  ping: createServiceRouter(pingServices),
});

export type ServiceRouter = typeof serviceRouter;
