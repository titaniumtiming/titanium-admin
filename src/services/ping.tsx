import { service } from "@/lib/service";

export const pingRacetecDb = service().mutation(async ({ ctx }) => {
  const result = await ctx.mssqlRacetecDb.request().query`SELECT 1`;
  return result;
});

export const pingRemoteDb = service().mutation(async ({ ctx }) => {
  const [result] = await ctx.mysqlRemoteDb.query(`SELECT 1`);
  return result;
});
