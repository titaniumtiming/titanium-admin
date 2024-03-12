import { service } from "@/lib/service";
import { RaceTableData, RaceTableSchema } from "@/schemas";
import { z } from "zod";

const syncRacesPullFromRacetec = service()
  .output(RaceTableSchema)
  .query(async ({ ctx }) => {
    const result = await ctx.localDb.request().query(`
    -- SQL Query (dbo.Race) Code Tested
    -- Lookup RaceId from dbo.Config. This returns the default race the user has open in Racetec.
    DECLARE @race_id INT;
    SELECT @race_id = FieldValue
    FROM dbo.Config
    WHERE SettingName = 'DefaultWebRace';
    IF @race_id IS NOT NULL
    BEGIN
        -- Define the SQL query for the race-id the user has open in Racetec.
        SELECT
            r.RaceId AS RaceId,
            r.RaceName AS RaceName,
            r.WebName AS WebName,
            r.RaceGroupingId AS RaceGroupingId,
            CONVERT(VARCHAR, r.RaceDate, 23) AS RaceDate,
            r.RaceYear AS RaceYear,
            r.RoundingTypeId AS RoundingTypeId,
            r.NetTimeRoundingTypeId AS NetTimeRoundingTypeId,
            r.FinishTimePrec AS FinishTimePrec,
            r.NetTimePrec AS NetTimePrec,
            r.RaceLocation AS RaceLocation,
            CASE WHEN r.IsEnabled = 1 THEN 1 ELSE 0 END AS IsEnabled, -- Convert IsEnabled to 1 or 0
            NULL AS TitleCaseSettings,
            COALESCE(raa1.AttribValue, 999) AS OrganiserId, -- This is an essential requirement for the website replace to 999 as a default value
            COALESCE(raa8.AttribValue, 1) AS LiveResults, -- This must be either 0 or 1, this forces the attribute to be created
            COALESCE(raa2.AttribValue, 0) AS ResultsRedirect, -- RThis is an essential requirement for the website. The default value is 0.
            raa3.AttribValue AS ResultsRedirectUrl,
            raa4.AttribValue AS RaceWebsite,
            raa5.AttribValue AS RaceTwitter,
            raa6.AttribValue AS RaceInstagram,
            raa7.AttribValue AS RaceFacebook
    -- RM ADD FEATUREDEVENT
        FROM
            dbo.Race r
        LEFT JOIN dbo.RaceAttribute raa1 ON r.RaceId = raa1.RaceId AND raa1.AttribName = 'OrgGroupId'
        LEFT JOIN dbo.RaceAttribute raa2 ON r.RaceId = raa2.RaceId AND raa2.AttribName = 'ResultsRedirect'
        LEFT JOIN dbo.RaceAttribute raa3 ON r.RaceId = raa3.RaceId AND raa3.AttribName = 'ResultsRedirectUrl'
        LEFT JOIN dbo.RaceAttribute raa4 ON r.RaceId = raa4.RaceId AND raa4.AttribName = 'RaceWebsite'
        LEFT JOIN dbo.RaceAttribute raa5 ON r.RaceId = raa5.RaceId AND raa5.AttribName = 'RaceTwitter'
        LEFT JOIN dbo.RaceAttribute raa6 ON r.RaceId = raa6.RaceId AND raa6.AttribName = 'RaceInstagram'
        LEFT JOIN dbo.RaceAttribute raa7 ON r.RaceId = raa7.RaceId AND raa7.AttribName = 'RaceFacebook'
        LEFT JOIN dbo.RaceAttribute raa8 ON r.RaceId = raa8.RaceId AND raa8.AttribName = 'LiveResults'
        LEFT JOIN dbo.RaceAttribute raa9 ON r.RaceId = raa9.RaceId AND raa9.AttribName = 'LiveResultsStartTime'
        LEFT JOIN dbo.RaceAttribute raa10 ON r.RaceId = raa10.RaceId AND raa10.AttribName = 'LiveResultsFinishTime'
        WHERE
            r.RaceId = @race_id;
    END
    ELSE
    BEGIN
        PRINT 'No race ID found.';
        -- Consider appropriate action if no race ID is found
    END;
      `);

    return result.recordset[0] as unknown as RaceTableData;
  });

const syncRacesPushToDigitalOcean = service()
  .input(RaceTableSchema)
  .mutation(async ({ ctx, input }) => {
    const result = await ctx.remoteDb.execute(
      `
      INSERT INTO \`dbo.Race\` (
        RaceId,
        RaceName,
        WebName,
        RaceGroupingId,
        RaceDate,
        RaceYear,
        RoundingTypeId,
        NetTimeRoundingTypeId,
        FinishTimePrec,
        NetTimePrec,
        RaceLocation,
        IsEnabled,
        TitleCaseSettings,
        OrganiserId,
        LiveResults,
        ResultsRedirect,
        ResultsRedirectUrl,
        RaceWebsite,
        RaceTwitter,
        RaceInstagram,
        RaceFacebook
      )
      VALUES (
        :RaceId,
        :RaceName,
        :WebName,
        :RaceGroupingId,
        :RaceDate,
        :RaceYear,
        :RoundingTypeId,
        :NetTimeRoundingTypeId,
        :FinishTimePrec,
        :NetTimePrec,
        :RaceLocation,
        :IsEnabled,
        :TitleCaseSettings,
        :OrganiserId,
        :LiveResults,
        :ResultsRedirect,
        :ResultsRedirectUrl,
        :RaceWebsite,
        :RaceTwitter,
        :RaceInstagram,
        :RaceFacebook
      )
      ON DUPLICATE KEY UPDATE
        RaceName = VALUES(RaceName),
        WebName = VALUES(WebName),
        RaceGroupingId = VALUES(RaceGroupingId),
        RaceDate = VALUES(RaceDate),
        RaceYear = VALUES(RaceYear),
        RoundingTypeId = VALUES(RoundingTypeId),
        NetTimeRoundingTypeId = VALUES(NetTimeRoundingTypeId),
        FinishTimePrec = VALUES(FinishTimePrec),
        NetTimePrec = VALUES(NetTimePrec),
        RaceLocation = VALUES(RaceLocation),
        IsEnabled = VALUES(IsEnabled),
        TitleCaseSettings = VALUES(TitleCaseSettings),
        OrganiserId = VALUES(OrganiserId),
        LiveResults = VALUES(LiveResults),
        ResultsRedirect = VALUES(ResultsRedirect),
        ResultsRedirectUrl = VALUES(ResultsRedirectUrl),
        RaceWebsite = VALUES(RaceWebsite),
        RaceTwitter = VALUES(RaceTwitter),
        RaceInstagram = VALUES(RaceInstagram),
        RaceFacebook = VALUES(RaceFacebook);
    `,
      input,
    );

    return result;
  });
export const syncRaces = service().mutation(async ({ ctx }) => {
  const race = await syncRacesPullFromRacetec(ctx);

  const pushResult = await syncRacesPushToDigitalOcean(ctx, race);

  // // @ts-expect-error
  //   const log = "";
  //   return log;
  return pushResult;
});

export default syncRaces;
