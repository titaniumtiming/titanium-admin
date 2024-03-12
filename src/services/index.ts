import { createServiceRouter } from "@/lib/create-service-router";
import { syncEvents } from "@/services/sync-events";
import { syncRaces } from "@/services/sync-races";

export const serviceRouter = createServiceRouter({
  syncRaces: syncRaces,
  syncEvents: syncEvents,
});

export type ServiceRouter = typeof serviceRouter;
