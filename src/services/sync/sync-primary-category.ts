import { service } from "@/lib/service";
import { z } from "zod";

export const PrimaryCategorySchema = z.object({
  RaceId: z.number(),
  EventId: z.number(),
  AgeCategoryId: z.number(),
  CategoryCode: z.string(),
  Category: z.string(),
  CategoryOrder: z.number(),
  MaleRecord: z.date().nullable(),
  FemaleRecord: z.union([z.date().nullable(), z.string().nullable()]),
  GenderId: z.number(),
});

export type PrimaryCategoryData = z.infer<typeof PrimaryCategorySchema>;

const pullPrimaryCategoriesFromRacetec = service()
  .output(z.array(PrimaryCategorySchema))
  .query(async ({ ctx }) => {
    const result = await ctx.mssqlRacetecDb.request().query(`
      -- SQL Query (dbo.EventAgeCateg) Code Tested
      -- Lookup RaceId from RTSys.dbo.Config. This returns the default race the user has open in Racetec.
      DECLARE @race_id INT;
      SELECT @race_id = FieldValue
      FROM RTSys.dbo.Config
      WHERE SettingName = 'DefaultWebRace';
      IF @race_id IS NOT NULL
      BEGIN
          -- Define the SQL query for (EventAgeCateg) for the race-id the user has open in Racetec.
          SELECT
              eac.[RaceId] AS [RaceId],
              eac.[EventId] AS [EventId],
              eac.[AgeCategoryId] AS [AgeCategoryId],
              eac.[CategoryCode] AS [CategoryCode],
              eac.[Category] AS [Category],
              eac.[CategoryOrder] AS [CategoryOrder],
              eac.[MaleRecord] AS [MaleRecord],
              eac.[FemaleRecord] AS [FemaleRecord],
              eac.[GenderId] AS [GenderId]
          FROM
              [RaceTec].[dbo].[EventAgeCategory] eac
          WHERE
              eac.RaceId = @race_id
          ORDER BY
              eac.RaceId ASC,
              eac.EventId ASC,
              eac.AgeCategoryId ASC;
      END
      ELSE
      BEGIN
          PRINT 'No race ID found.';
          -- Consider appropriate action if no race ID is found
      END;
    `);

    return result.recordset as PrimaryCategoryData[];
  });

const pushPrimaryCategoriesToRemoteDb = service()
  .input(z.array(PrimaryCategorySchema))
  .mutation(async ({ ctx, input }) => {
    return ctx.bulkInsertIntoRemoteDb({
      tableName: "dbo.EventAgeCategory",
      data: input,
      updateOnDuplicate: true,
    });
  });

export const syncPrimaryCategories = service().mutation(async ({ ctx }) => {
  const primaryCategories = await pullPrimaryCategoriesFromRacetec(ctx);

  const pushResult = await pushPrimaryCategoriesToRemoteDb(
    ctx,
    primaryCategories,
  );
  return pushResult;
});
