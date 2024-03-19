import { service } from "@/lib/service";
import { z } from "zod";

const defaultRaceDetailsSchema = z.object({
  RaceId: z.number(),
  RaceName: z.string(),
  RaceDate: z.string(),
});

export type DefaultRaceDetails = z.infer<typeof defaultRaceDetailsSchema>;

export const getDefaultRaceDetails = service()
  .output(defaultRaceDetailsSchema)
  .query(async ({ ctx }) => {
    const result = await ctx.mssqlRacetecDb.query(`
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
        r.RaceId AS RaceId,
        r.RaceName AS RaceName,
        CONVERT(VARCHAR, r.RaceDate, 23) AS RaceDate

    FROM
        RTSys.dbo.Race r
    WHERE
        r.RaceId = @race_id;
END
ELSE
BEGIN
    PRINT 'No race ID found.';
    -- Consider appropriate action if no race ID is found
END;`);

    return result?.recordset?.[0] as DefaultRaceDetails;
  });
