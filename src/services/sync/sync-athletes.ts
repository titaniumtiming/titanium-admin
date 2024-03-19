import { service } from "@/lib/service";
import { z } from "zod";

export const AthleteSchema = z.object({
  RaceId: z.number(),
  EventId: z.number(),
  AthleteId: z.number(),
  RaceNo: z.number().nullable(),
  FirstName: z.string(),
  LastName: z.string(),
  GenderId: z.number(),

  ClubName: z.string().nullable(),
  AgeCategoryId: z.number().nullable(),
  Category: z.string().nullable(),
  SecondaryCategoryId: z.number().nullable(),
  SecondaryCategory: z.string().nullable(),
  EAGUID: z.string(),
});

export type AthleteData = z.infer<typeof AthleteSchema>;

const pullAthletesFromRacetec = service()
  .output(z.array(AthleteSchema))
  .query(async ({ ctx }) => {
    const result = await ctx.mssqlRacetecDb.request().query(`
      -- SQL Query (dbo.EventAthleteBio) Code Tested
      -- Lookup RaceId from RTSys.dbo.Config. This returns the default race the user has open in Racetec.
      DECLARE @race_id INT;
      SELECT @race_id = FieldValue
      FROM RTSys.dbo.Config
      WHERE SettingName = 'DefaultWebRace';

      IF @race_id IS NOT NULL
      BEGIN
          -- Define the SQL query for (EventAthleteBio) for the race-id the user has open in Racetec.
          SELECT
              ea.RaceId,
              ea.EventId,
              ea.AthleteId,
              ea.RaceNo,
              a.FirstName,
              a.LastName,
              a.GenderId,
              c.ClubName,
              ea.AgeCategoryId,
              eac.Category,
              ea.SecondaryCategoryId,
              esc.Category AS SecondaryCategory,
              ea.EAGUID
          FROM
              [Racetec].[dbo].[Athlete] a
              JOIN [RaceTec].[dbo].[EventAthlete] ea ON a.AthleteId = ea.AthleteId
              LEFT JOIN [Racetec].[dbo].[EventAgeCategory] eac ON ea.RaceId = eac.RaceId
                  AND ea.EventId = eac.EventId
                  AND ea.AgeCategoryId = eac.AgeCategoryId
              LEFT JOIN [Racetec].[dbo].[EventSecondaryCategory] esc ON ea.RaceId = esc.RaceId
                  AND ea.EventId = esc.EventId
                  AND ea.SecondaryCategoryId = esc.AgeCategoryId
              LEFT JOIN [RaceTec].[dbo].[Club] c ON ea.ClubId = c.ClubId
              LEFT JOIN [RTSys].[dbo].Gender g ON a.GenderId = g.GenderId
          WHERE
              ea.RaceId = @race_id
          ORDER BY
              ea.RaceId ASC,
              ea.EventId ASC,
              ea.AthleteId ASC;
      END
      ELSE
      BEGIN
          PRINT 'No race ID found.';
          -- Consider appropriate action if no race ID is found
      END;
    `);

    return result.recordset as AthleteData[];
  });

const pushAthletesToRemoteDb = service()
  .input(z.array(AthleteSchema))
  .mutation(async ({ ctx, input }) => {
    return ctx.bulkInsertIntoRemoteDb({
      tableName: "dbo.EventAthleteBio",
      data: input,
      updateOnDuplicate: true,
    });
  });

export const syncAthletes = service().mutation(async ({ ctx }) => {
  const athletes = await pullAthletesFromRacetec(ctx);
  const pushResult = await pushAthletesToRemoteDb(ctx, athletes);
  return pushResult;
});
