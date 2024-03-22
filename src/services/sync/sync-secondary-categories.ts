import { service } from "@/lib/service";
import { z } from "zod";

export const SecondaryCategorySchema = z.object({
  RaceId: z.number(), // *
  EventId: z.number(), // *
  AgeCategoryId: z.number(), // *
  CategoryCode: z.string().nullable(),
  Category: z.string(),
  CategoryOrder: z.number(),
  MaleRecord: z.date().nullable(),
  FemaleRecord: z.union([z.date().nullable(), z.string().nullable()]),
  GenderId: z.number().nullable(),
});

export type SecondaryCategoryData = z.infer<typeof SecondaryCategorySchema>;

export const SecondaryCategoryCompositeKey = [
  "RaceId",
  "EventId",
  "AgeCategoryId",
] satisfies Partial<keyof SecondaryCategoryData>[];

const pullSecondaryCategoriesFromRacetec = service()
  .output(z.array(SecondaryCategorySchema))
  .query(async ({ ctx }) => {
    const result = await ctx.mssqlRacetecDb.request().query(`
    -- SQL Query (dbo.EventAgeSecondCateg) Code Tested
    -- Secondary age category's are not used on all event so this may return a null result
    -- Lookup RaceId from RTSys.dbo.Config. This returns the default race the user has open in Racetec.
    DECLARE @race_id INT;
    SELECT @race_id = FieldValue 
    FROM RTSys.dbo.Config 
    WHERE SettingName = 'DefaultWebRace';
    
    IF @race_id IS NOT NULL
    BEGIN
        -- Define the SQL query for (EventAgeSecondCateg) for the race-id the user has open in Racetec.
    SELECT 
        esc.[RaceId] AS [RaceId],
        esc.[EventId] AS [EventId],
        esc.[AgeCategoryId] AS [AgeCategoryId],
        esc.[CategoryCode] AS [CategoryCode],
        esc.[Category] AS [Category],
        esc.[CategoryOrder] AS [CategoryOrder],
        esc.[MaleRecord] AS [MaleRecord],
        esc.[FemaleRecord] AS [FemaleRecord],
        esc.[GenderId] AS [GenderId]
    
    FROM
        [RaceTec].[dbo].[EventSecondaryCategory] esc
    
    WHERE
        esc.RaceId = @race_id
    
    ORDER BY 
        esc.RaceId ASC, esc.EventId ASC, esc.AgeCategoryId ASC;
    END
    ELSE
    BEGIN
        PRINT 'No race ID found.';
        -- Consider appropriate action if no race ID is found
    END;
    `);

    return result.recordset as SecondaryCategoryData[];
  });

const pushSecondaryCategoryToRemoteDb = service()
  .input(z.array(SecondaryCategorySchema))
  .mutation(async ({ ctx, input }) => {
    return ctx.bulkInsertIntoRemoteDb({
      tableName: "dbo.EventSecondaryCategory",
      data: input,
      updateOnDuplicate: true,
    });
  });

export const syncSecondaryCategories = service().mutation(async ({ ctx }) => {
  const secondaryCategories = await pullSecondaryCategoriesFromRacetec(ctx);
  const pushResult = await pushSecondaryCategoryToRemoteDb(
    ctx,
    secondaryCategories,
  );

  await ctx.deleteFromRemoteIfNotInRacetec({
    compositeKey: SecondaryCategoryCompositeKey,
    tableName: "dbo.EventSecondaryCategory",
    itemsInRacetec: secondaryCategories,
  });
  return pushResult;
});
