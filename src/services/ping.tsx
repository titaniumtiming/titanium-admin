import { service } from "@/lib/service";

export const pingRacetecDb = service().mutation(async ({ ctx }) => {
  // const result = await ctx.mssqlRacetecDb.request().query`SELECT 1`;
  const result = await ctx.mssqlRacetecDb.request()
    .query`select * from RaceTec.dbo.RaceEvent where RaceId = 6019;`;
  return result;
});

export const pingRemoteDb = service().mutation(async ({ ctx }) => {
  // const [result] = await ctx.mysqlRemoteDb.query(`SELECT 1`);
  const [result] = await ctx.mysqlRemoteDb.query(`SELECT COLUMN_NAME
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'dbo.EventAthleteResults';`);
  return result;
});
