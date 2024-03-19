/**
 
need to be able to have count for each one of these:

export const syncServices = {
  Races: syncRaces,
  Events: syncEvents,
  PrimaryCategories: syncPrimaryCategories,
  SecondaryCategories: syncSecondaryCategories,
  AthleteResults: syncAthleteResults,
  AthleteSplits: syncRaces,
  Athletes: syncAthletes,
  Splits: syncSplits,
} satisfies Record<SyncDbTableName, unknown>;

 */

import { service } from "@/lib/service";
import { z } from "zod";

const dbTypeSchema = z.enum(["remote", "local"]);

/**
 * --Local DB Count SQL Queries



--Events
DECLARE @race_id INT;
SELECT @race_id = FieldValue 
FROM RTSys.dbo.Config 
WHERE SettingName = 'DefaultWebRace';

IF @race_id IS NOT NULL
BEGIN
    -- Define the SQL query for the race-id the user has open in Racetec.
    SELECT COUNT(*) AS NumberOfRows
    FROM [RaceTec].[dbo].[RaceEvent] re
    WHERE re.RaceId = @race_id;
END
ELSE
BEGIN
    PRINT 'No race ID found.';
END;

--Categories
DECLARE @race_id INT;
SELECT @race_id = FieldValue 
FROM RTSys.dbo.Config 
WHERE SettingName = 'DefaultWebRace';

IF @race_id IS NOT NULL
BEGIN
    -- Define the SQL query for the count of rows for the race-id the user has open in Racetec.
    SELECT COUNT(*) AS NumberOfRows
    FROM [RaceTec].[dbo].[EventAgeCategory] eac
    WHERE eac.RaceId = @race_id;
END
ELSE
BEGIN
    PRINT 'No race ID found.';
END;

--Secondary Categories
DECLARE @race_id INT;
SELECT @race_id = FieldValue 
FROM RTSys.dbo.Config 
WHERE SettingName = 'DefaultWebRace';

IF @race_id IS NOT NULL
BEGIN
    -- Define the SQL query for the count of rows for the race-id the user has open in Racetec.
    SELECT COUNT(*) AS NumberOfRows
    FROM [RaceTec].[dbo].[EventSecondaryCategory] esc
    WHERE esc.RaceId = @race_id;
END
ELSE
BEGIN
    PRINT 'No race ID found.';
END;

--Splits
DECLARE @race_id INT;
SELECT @race_id = FieldValue 
FROM RTSys.dbo.Config 
WHERE SettingName = 'DefaultWebRace';

IF @race_id IS NOT NULL
BEGIN
    -- Define the SQL query for the count of rows for the race-id the user has open in Racetec.
    SELECT COUNT(*) AS NumberOfRows
    FROM RaceTec.dbo.EventSplit es
    WHERE es.RaceId = @race_id;
END
ELSE
BEGIN
    PRINT 'No race ID found.';
END;



--Athletes
DECLARE @race_id INT;
SELECT @race_id = FieldValue 
FROM RTSys.dbo.Config 
WHERE SettingName = 'DefaultWebRace';

IF @race_id IS NOT NULL
BEGIN
    -- Define the SQL query for the count of rows for the race-id the user has open in Racetec.
    SELECT COUNT(*) AS NumberOfRows
    FROM 
        [Racetec].[dbo].[Athlete] a
    JOIN [RaceTec].[dbo].[EventAthlete] ea ON a.AthleteId = ea.AthleteId
    LEFT JOIN [Racetec].[dbo].[EventAgeCategory] eac ON ea.RaceId = eac.RaceId AND ea.EventId = eac.EventId AND ea.AgeCategoryId = eac.AgeCategoryId
    LEFT JOIN [Racetec].[dbo].[EventSecondaryCategory] esc ON ea.RaceId = esc.RaceId AND ea.EventId = esc.EventId AND ea.SecondaryCategoryId = esc.AgeCategoryId
    LEFT JOIN [RaceTec].[dbo].[Club] c ON ea.ClubId = c.ClubId
    LEFT JOIN [RTSys].[dbo].[Gender] g ON a.GenderId=g.GenderId
    WHERE ea.RaceId=@race_id;
END
ELSE
BEGIN
    PRINT 'No race ID found.';
END;

--Athlete Results
DECLARE @race_id INT;
SELECT @race_id = FieldValue 
FROM RTSys.dbo.Config 
WHERE SettingName = 'DefaultWebRace';

IF @race_id IS NOT NULL
BEGIN
    -- Define the SQL query for the count of rows for the race-id the user has open in Racetec.
    SELECT COUNT(*) AS NumberOfRows
    FROM 
        [Racetec].[dbo].[Athlete] a
    JOIN [Racetec].[dbo].[EventAthlete] ea ON a.AthleteId = ea.AthleteId
    LEFT JOIN [Racetec].[dbo].[EventTeam] et ON ea.RaceId = et.RaceId AND ea.EventId = et.EventId AND ea.TeamId = et.TeamId
    LEFT JOIN [Racetec].[dbo].[EventTeamType] ett ON et.RaceId = ett.RaceId AND et.EventId = ett.EventId AND et.TeamTypeId = ett.TeamTypeId
    JOIN [Racetec].[dbo].[EventGun] eg ON ea.RaceId = eg.RaceId AND ea.EventId = eg.EventId AND ea.EventGunId = eg.EventGunId
    WHERE ea.RaceId=@race_id;
END
ELSE
BEGIN
    PRINT 'No race ID found.';
END;

 */

export const Races = service()
  .input({ dbType: dbTypeSchema })
  .query(async ({ ctx, input }) => {
    if (input.dbType === "local") {
      return ctx.mssqlRacetecDb.request().query(`
      --Race
DECLARE @race_id INT;
SELECT @race_id = FieldValue 
FROM RTSys.dbo.Config 
WHERE SettingName = 'DefaultWebRace';

IF @race_id IS NOT NULL
BEGIN
    -- Define the SQL query for the race-id the user has open in Racetec.
    SELECT COUNT(*) AS NumberOfRows
    FROM RTSys.dbo.Race r
    WHERE r.RaceId = @race_id;
END
ELSE
BEGIN
    PRINT 'No race ID found.';
END;`);
    }

    if (input.dbType === "remote") {
      return ctx.mysqlRemoteDb.query(``);
    }
  });
