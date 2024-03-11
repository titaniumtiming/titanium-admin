import { createServiceRouter } from "@/lib/create-service-router";
import { createTRPCRouter } from "@/lib/trpc/trpc";
import { syncRaces } from "@/services/sync-races";

export const services = {
  syncRaces: syncRaces,
};

export const serviceRouter = createServiceRouter(services);

export type ServiceRouter = typeof serviceRouter;
