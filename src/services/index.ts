import {
  createServiceRouter,
  createTRPCProcedure,
} from "@/lib/create-service-router";
import { createTRPCRouter } from "@/lib/trpc/trpc";
import { SyncDbTableName } from "@/schemas";
import { syncAll } from "@/services/sync-all";
import { syncEvents } from "@/services/sync/sync-events";
import { syncRaces } from "@/services/sync/sync-races";
import { pingDatabase } from "@/services/ping";
import * as countServices from "@/services/count";
import { syncPrimaryCategories } from "@/services/sync/sync-primary-category";
import { syncSecondaryCategories } from "@/services/sync/sync-secondary-categories";
import { syncAthletes } from "@/services/sync/sync-athletes";
import { syncSplits } from "@/services/sync/sync-splits";
import { syncAthleteResults } from "@/services/sync/sync-athlete-results";
import { syncAthleteSplits } from "@/services/sync/sync-athlete-splits";
import { getDefaultRaceDetails } from "@/services/default-race-details";
export const syncServices = {
  Races: syncRaces,
  Events: syncEvents,
  PrimaryCategories: syncPrimaryCategories,
  SecondaryCategories: syncSecondaryCategories,
  AthleteResults: syncAthleteResults,
  AthleteSplits: syncAthleteSplits,
  Athletes: syncAthletes,
  Splits: syncSplits,
} satisfies Record<SyncDbTableName, unknown>;

export const serviceRouter = createTRPCRouter({
  syncAll: createTRPCProcedure(syncAll),
  sync: createServiceRouter(syncServices),
  count: createServiceRouter(countServices),
  ping: createTRPCProcedure(pingDatabase),
  getDefaultRaceDetails: createTRPCProcedure(getDefaultRaceDetails),
});

export type ServiceRouter = typeof serviceRouter;
