import { service } from "@/lib/service";
import { syncServices } from "@/services";

export const syncAll = service().mutation(async ({ ctx }) => {
  await Promise.all(
    Object.entries(syncServices).map(([tableName, syncService]) =>
      syncService(ctx),
    ),
  );
});
