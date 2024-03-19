import { service } from "@/lib/service";
import { z } from "zod";

export const pingDatabase = service()
  .input({
    type: z.enum(["RaceTec", "Remote"]),
  })
  .mutation(async ({ ctx, input }) => {
    if (input.type === "RaceTec") {
      const result = await ctx.mssqlRacetecDb.request().query`SELECT 1`;
      return result;
    }

    if (input.type === "Remote") {
      const [result] = await ctx.mysqlRemoteDb.query(`SELECT 1`);
      return result;
    }
  });
