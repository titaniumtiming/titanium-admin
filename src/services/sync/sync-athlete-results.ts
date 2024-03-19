import { service } from "@/lib/service";
import { z } from "zod";

export const AthleteResultSchema = z.object({
  RaceId: z.number(),
  EventId: z.number(),
  AthleteId: z.number(),
  RaceNo: z.number().nullable(),
  FinishStatusId: z.number(),
  GunTime: z.date().nullable(),
  EventGunDescr: z.string().nullable(), // Updated field name
  NetTime: z.string().nullable(),
  FinishTime: z.date().nullable(),
  DeadZoneTime: z.string().nullable(),
  FinishTOD: z.date().nullable(),
  PenaltyTime: z.string().nullable(),
  TimeBehindOverall: z.string().nullable(),
  TimeBehindCateg: z.string().nullable(),
  TimeBehindGender: z.string().nullable(),
  OverallFinishPosition: z.number().nullable(),
  CategoryFinishPosition: z.number().nullable(),
  SecondaryCategoryPosition: z.number().nullable(),
  GenderFinishPosition: z.number().nullable(),
  NetOverallPos: z.number().nullable(),
  NetCategoryPos: z.number().nullable(),
  NetGenderPos: z.number().nullable(),
  FastestLap: z.string().nullable(),
  FastestLapNo: z.number().nullable(),
  SlowestLap: z.string().nullable(),
  AverageLap: z.string().nullable(),
  NoLaps: z.number().nullable(),
  DistanceDone: z.number().nullable(),
  TeamName: z.string().nullable(),
  TeamType: z.string().nullable(),
  TeamPos: z.number().nullable(), // Updated field name
  TeamTime: z.string().nullable(), // Updated field name
  TeamPosSum: z.number().nullable(), // Added field
  TeamLapsSum: z.number().nullable(), // Added field
  AthletePosInTeam: z.number().nullable(), // Updated field name
  TeamAthleteCount: z.number().nullable(), // Updated field name
  TeamMaxAthletesCount: z.number().nullable(), // Added field
  ModifyDate: z.date(),
  EAGUID: z.string(),
});
export type AthleteResultData = z.infer<typeof AthleteResultSchema>;

const pullAthleteResultsFromRacetec = service()
  .output(z.array(AthleteResultSchema))
  .query(async ({ ctx }) => {
    const result = await ctx.mssqlRacetecDb.request().query(`
    -- SQL Query (dbo.EventAthleteResults) Code Tested
    -- Lookup RaceId from RTSys.dbo.Config. This returns the default race the user has open in Racetec.
    DECLARE @race_id INT;
    SELECT @race_id = FieldValue 
    FROM RTSys.dbo.Config 
    WHERE SettingName = 'DefaultWebRace';
    
    IF @race_id IS NOT NULL
    BEGIN
        -- Define the SQL query for (EventAthleteResults) for the race-id the user has open in Racetec.
    SELECT 
    ea.RaceId
    ,ea.EventId
    ,ea.AthleteId
    ,ea.RaceNo
    ,ea.FinishStatusId
    ,eg.GunTime
    ,eg.EventGunDescr --CHANGED DB NAME FROM EventGunDesc to EventGunDescr
    ,ea.NetTime
    ,ea.FinishTime
    ,ea.DeadZoneTime
    ,ea.FinishTOD
    ,ea.PenaltyTime
    , RTSys.dbo.GetTimeDiffDECRs(0, ea.FinishTime - tbo.FinishTime, 3, 1701377)  as [TimeBehindOverall]
    , RTSys.dbo.GetTimeDiffDECRs(0, ea.FinishTime - tbc.FinishTime, 3, 1701377)  as [TimeBehindCateg]
    , RTSys.dbo.GetTimeDiffDECRs(0, ea.FinishTime - tbg.FinishTime, 3, 1701377)  as [TimeBehindGender]
    ,ea.OverallFinishPosition
    ,ea.CategoryFinishPosition
    ,ea.SecondaryCategoryPosition
    ,ea.GenderFinishPosition
    ,ea.NetOverallPos
    ,ea.NetCategoryPos
    ,ea.NetGenderPos
    --MULTILAP INFORMATION
    ,ea.FastestLap
    ,ea.FastestLapNo
    ,ea.SlowestLap
    ,ea.AverageLap
    ,ea.NoLaps
    ,ea.DistanceDone
    --TEAM INFORMATION
    ,et.TeamName
    ,ett.TeamType
    ,et.FinishPosition as [TeamPos]
    ,RTSys.dbo.GetFinishTimeDECRs(0, et.FinishTime, 3, 0)  as [TeamTime]
    ,et.TotalTeamPos as [TeamPosSum]
    ,et.TeamLaps as [TeamLapsSum]
    ,ea.TeamFinishPosition as [AthletePosInTeam]
    ,ett.ResultAthleteCount as [TeamAthleteCount]
    ,ett.MaxToCount as [TeamMaxAthletesCount]
    --MODIFICATION INFORMATION
    ,ea.ModifyDate
    ,ea.EAGUID
    
    FROM 
        [Racetec].[dbo].[Athlete] a
      
      JOIN [Racetec].[dbo].[EventAthlete] ea
        on a.AthleteId = ea.AthleteId
      
      LEFT JOIN [RaceTec].[dbo].[EventTeam] et
        on ea.RaceId = et.RaceId
        and ea.EventId = et.EventId
        and ea.TeamId = et.TeamId
        
      LEFT JOIN [Racetec].[dbo].[EventTeamType] ett
        on et.RaceId = ett.RaceId
        and et.EventId = ett.EventId
        and et.TeamTypeId = ett.TeamTypeId
        
      JOIN [Racetec].[dbo].[EventGun] eg
        on ea.RaceId = eg.RaceId
        and ea.EventId = eg.EventId
        and ea.EventGunId = eg.EventGunId
        
        --<tbo TimeBehindOverallLeader>
      left join (	select ea.RaceId, ea.EventId, min(ea.FinishTime) as FinishTime, count(*) as OverallCount
            from 
              [Racetec].[dbo].[EventAthlete] ea 
              join [Racetec].[dbo].[Athlete] a
                on ea.AthleteId = a.AthleteId
            where
              ea.RaceId = @race_id
              and ea.FinishStatusId = 4 
            group by ea.RaceId, ea.EventId
            ) tbo
        on ea.RaceId = tbo.RaceId
        and ea.EventId = tbo.EventId
      --<\tbo TimeBehindOverallLeader>
      
      --<tbc TimeBehindCategLeader>
      left join (	select ea.RaceId, ea.EventId, a.GenderId, ea.AgeCategoryId, min(ea.FinishTime) as FinishTime, count(*) as CategCount
            from 
              [Racetec].[dbo].[EventAthlete] ea
              join [Racetec].[dbo].[Athlete] a
                on ea.AthleteId = a.AthleteId
            where
              ea.RaceId = @race_id
              and ea.FinishStatusId = 4 
            group by ea.RaceId, ea.EventId, a.GenderId, ea.AgeCategoryId
            ) tbc
        on ea.RaceId = tbc.RaceId
        and ea.EventId = tbc.EventId
        and ea.AgeCategoryId = tbc.AgeCategoryId
        and a.GenderId = tbc.GenderId
      --<\tbc TimeBehindCategLeader>
      
      --<tbg TimeBehindGender>
      left join (	select ea.RaceId, ea.EventId, a.GenderId, min(ea.FinishTime) as FinishTime, count(*) as GenderCount
            from 
              [Racetec].[dbo].[EventAthlete] ea 
              join [Racetec].[dbo].[Athlete] a
                on ea.AthleteId = a.AthleteId
            where
              ea.RaceId = @race_id
              and ea.FinishStatusId = 4 
            group by ea.RaceId, ea.EventId, a.GenderId
            ) tbg
        on ea.RaceId = tbg.RaceId
        and ea.EventId = tbg.EventId
        and a.GenderId = tbg.GenderId
      --<\tbg TimeBehindGender>
    
      Where ea.RaceId=@race_id
      
      ORDER BY ea.RaceId ASC, ea.EventId ASC, ea.AthleteId ASC
    
    END
    ELSE
    BEGIN
        PRINT 'No race ID found.';
        -- Consider appropriate action if no race ID is found
    END;
    
    `);

    return result.recordset as AthleteResultData[];
  });

const pushAthleteResultsToRemoteDb = service()
  .input(z.array(AthleteResultSchema))
  .mutation(async ({ ctx, input }) => {
    return ctx.bulkInsertIntoRemoteDb({
      tableName: "dbo.EventAthleteResults",
      data: input,
      updateOnDuplicate: true,
    });
  });

export const syncAthleteResults = service().mutation(async ({ ctx }) => {
  const athleteResults = await pullAthleteResultsFromRacetec(ctx);
  const pushResult = await pushAthleteResultsToRemoteDb(ctx, athleteResults);
  return pushResult;
});
