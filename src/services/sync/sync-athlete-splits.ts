import { service } from "@/lib/service";
import { z } from "zod";

export const AthleteSplitSchema = z.object({
  RaceId: z.number(),
  EventId: z.number(),
  AthleteId: z.number(),
  SplitId: z.number(),
  PrevSplitId: z.number().nullable(),
  PrevLegId: z.number().nullable(),
  SplitTimeTOD: z.date().nullable(),
  TimeFromGun: z.date().nullable(),
  TimeFromPrevLeg: z.date().nullable(),
  OverallPosition: z.number().nullable(),
  CategoryPosition: z.number().nullable(),
  GenderPosition: z.number().nullable(),
  SplitOverallPos: z.number().nullable(),
  SplitGenderPos: z.number().nullable(),
  SplitCategoryPos: z.number().nullable(),
  PenaltyTime: z.string().nullable(),
  PenaltyReasonId: z.number().nullable(),
  SplitNetTime: z.string().nullable(),
  DeadZoneTime: z.string().nullable(),
  SplitDeadZoneTime: z.string().nullable(),
  TeamMemberName: z.string().nullable(),
  CreateDate: z.date(),
});

export type AthleteSplitData = z.infer<typeof AthleteSplitSchema>;

const pullAthleteSplitsFromRacetec = service()
  .output(z.array(AthleteSplitSchema))
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

SELECT 
    as2.[RaceId],
    as2.[EventId],
    as2.[AthleteId],
    as2.[SplitId],
    prev.PrevSplitId,
    prevLeg.PrevLegId,

    --Split Time Data
    as2.[SplitTime] as SplitTimeTOD,
    --eg.[GunTime],
    DATEADD(millisecond, DATEDIFF(millisecond, eg.[GunTime], as2.[SplitTime]), CAST('00:00:00' AS datetime)) AS TimeFromGun,

    --PrevLegTimeCalc
    CASE 
        WHEN prevLegSplitTime.PrevLegSplitTime IS NOT NULL THEN 
            DATEADD(MILLISECOND, DATEDIFF(MILLISECOND, prevLegSplitTime.PrevLegSplitTime, as2.SplitTime), CAST('00:00:00' AS datetime))
        ELSE 
            NULL
    END AS TimeFromPrevLeg,

    as2.[OverallPosition],
    as2.[CategoryPosition],
    as2.[GenderPosition],
    as2.[SplitOverallPos],
    as2.[SplitGenderPos],
    as2.[SplitCategoryPos],
    as2.[PenaltyTime],

    --ADD REASON RATHER THAN ID
    as2.[PenaltyReasonId],
    as2.[SplitNetTime],
    as2.[DeadZoneTime],
    as2.[SplitDeadZoneTime],
    eaa.[Value] as [TeamMemberName],
    as2.[CreateDate]
FROM
    [Racetec].[dbo].[Athlete] a
JOIN 
    [Racetec].[dbo].[EventAthlete] ea ON a.AthleteId = ea.AthleteId
LEFT JOIN 
    [RaceTec].[dbo].[AthleteSplit] as2 ON as2.RaceId = ea.RaceId
                                         AND as2.EventId = ea.EventId
                                         AND as2.AthleteId = ea.AthleteId
LEFT JOIN 
    [RaceTec].[dbo].[EventSplit] es ON as2.RaceId = es.RaceId
                                      AND as2.EventId = es.EventId
                                      AND as2.SplitId = es.SplitId
LEFT JOIN 
    [Racetec].[dbo].[EventGun] eg ON ea.RaceId = eg.RaceId
                                     AND ea.EventId = eg.EventId
                                     AND ea.EventGunId = eg.EventGunId

LEFT JOIN
    [Racetec].[dbo].[EventAthleteAttribute] eaa ON as2.RaceId = eaa.RaceId
                                AND as2.EventId = eaa.EventId
                                AND as2.AthleteId = eaa.AthleteId
                                AND as2.ChipCode = eaa.ChipCode
OUTER APPLY (
    SELECT TOP 1 WITH TIES es2.SplitOrder, es2.SplitId AS PrevSplitId
    FROM [Racetec].[dbo].[EventSplit] es2
    WHERE es2.RaceId = as2.RaceId
        AND es2.EventId = as2.EventId
        AND es2.SplitType = 3
        AND es2.SplitOrder < es.SplitOrder
    ORDER BY es2.SplitOrder DESC
) prev

OUTER APPLY (
    SELECT TOP 1 WITH TIES es3.SplitId AS PrevLegId
    FROM [Racetec].[dbo].[EventSplit] es3
    WHERE es3.RaceId = as2.RaceId
        AND es3.EventId = as2.EventId
        AND es3.SplitType = 8
        AND es3.SplitOrder < es.SplitOrder
    ORDER BY es3.SplitOrder DESC
) prevLeg
OUTER APPLY (
    SELECT TOP 1 as3.SplitTime AS PrevSplitTime
    FROM [RaceTec].[dbo].[AthleteSplit] as3
    WHERE as3.RaceId = as2.RaceId
        AND as3.EventId = as2.EventId
        AND as3.AthleteId = as2.AthleteId
        AND as3.SplitId = prev.PrevSplitId
) prevSplitTime
OUTER APPLY (
    SELECT TOP 1 as4.SplitTime AS PrevLegSplitTime
    FROM [RaceTec].[dbo].[AthleteSplit] as4
    WHERE as4.RaceId = as2.RaceId
        AND as4.EventId = as2.EventId
        AND as4.AthleteId = as2.AthleteId
        AND as4.SplitId = prevLeg.PrevLegId
) prevLegSplitTime
WHERE 
    as2.[RaceId] = @race_id

ORDER BY 
    as2.RaceId ASC, as2.EventId ASC, as2.AthleteId ASC, es.SplitOrder ASC;

END
    `);

    return result.recordset as AthleteSplitData[];
  });

const pushAthleteSplitsToRemoteDb = service()
  .input(z.array(AthleteSplitSchema))
  .mutation(async ({ ctx, input }) => {
    return ctx.bulkInsertIntoRemoteDb({
      tableName: "dbo.SplitResults",
      data: input,
      updateOnDuplicate: true,
    });
  });

export const syncAthleteSplits = service().mutation(async ({ ctx }) => {
  const athleteSplits = await pullAthleteSplitsFromRacetec(ctx);
  const pushResult = await pushAthleteSplitsToRemoteDb(ctx, athleteSplits);
  return pushResult;
});
