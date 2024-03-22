import { service } from "@/lib/service";
import { z } from "zod";

export const SplitSchema = z.object({
  RaceId: z.number(),
  EventId: z.number(),
  SplitId: z.number(),
  SplitOrder: z.number(),
  SplitName: z.string(),
  SplitWebName: z.string().nullable(),
  SplitTypeId: z.number(),
  DistanceFromStart: z.number().nullable(),
  IsDeadZone: z.boolean().nullable(),
});

export type SplitData = z.infer<typeof SplitSchema>;

const pullSplitsFromRacetec = service()
  .output(z.array(SplitSchema))
  .query(async ({ ctx }) => {
    const result = await ctx.mssqlRacetecDb.request().query(`
      -- SQL Query (dbo.Race) Code Tested
      -- Lookup RaceId from RTSys.dbo.Config. This returns the default race the user has open in Racetec.
      DECLARE @race_id INT;
      SELECT @race_id = FieldValue
      FROM RTSys.dbo.Config
      WHERE SettingName = 'DefaultWebRace';
    
      IF @race_id IS NOT NULL
      BEGIN
          -- Define the SQL query for the race-id the user has open in Racetec.
          SELECT
              es.RaceId,
              es.EventId,
              es.SplitId,
              es.SplitOrder,
              es.SplitName,
              es.WebName AS SplitWebName,
              es.SplitType AS SplitTypeId,
              es.DistanceFromStart,
              es.IsDeadZone
          FROM
              RaceTec.dbo.EventSplit es
          WHERE
              es.RaceId = @race_id;
      END
      ELSE
      BEGIN
          PRINT 'No race ID found.';
          -- Consider appropriate action if no race ID is found
      END;
    `);

    return result.recordset as SplitData[];
  });

const pushSplitsToRemoteDb = service()
  .input(z.array(SplitSchema))
  .mutation(async ({ ctx, input }) => {
    return ctx.bulkInsertIntoRemoteDb({
      tableName: "dbo.EventSplit",
      data: input,
      updateOnDuplicate: true,
    });
  });

export const syncSplits = service().mutation(async ({ ctx }) => {
  const splits = await pullSplitsFromRacetec(ctx);
  const pushResult = await pushSplitsToRemoteDb(ctx, splits);
  return pushResult;
});
