import { service } from "@/lib/service";
import { syncServices } from "@/services";

export const syncAll = service().mutation(async ({ ctx }) => {
  // If use Promise.all get errors (too many connections) so must run sequentially

  const results = [] as any[];
  for (const [tableName, syncService] of Object.entries(syncServices)) {
    const result = await syncService(ctx);
    results.push([tableName, result]);
  }

  return results;
});
