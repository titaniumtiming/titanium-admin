import { service } from "@/lib/service";
import { z } from "zod";

export const EventTableSchema = z.object({
  RaceId: z.number(),
  EventId: z.number(),
  EventDescr: z.string(),
  WebName: z.string(),
  EventOrder: z.number(),
  EventSpeedDistMi: z.number(),
  EventSpeedPostFix: z.string().nullable(),
  EventIsEnabled: z.number(),
  IsMultiLap: z.number(),
});

export type EventTableData = z.infer<typeof EventTableSchema>;

const pullEventsFromRacetec = service()
  .output(z.array(EventTableSchema))
  .query(async ({ ctx }) => {
    const result = await ctx.mssqlRacetecDb.request().query(`
      -- SQL Query (dbo.RaceEvent) Code Tested
      -- Lookup RaceId from dbo.Config. This returns the default race the user has open in Racetec.
      DECLARE @race_id INT;
      SELECT @race_id = FieldValue
      FROM dbo.Config
      WHERE SettingName = 'DefaultWebRace';
      IF @race_id IS NOT NULL
      BEGIN
          -- Define the SQL query for the race-id the user has open in Racetec.
          SELECT
              re.RaceId AS [RaceId],
              re.EventId AS [EventId],
              re.EventDescr AS [EventDescr],
              re.WebName AS [WebName],
              re.EventOrder AS [EventOrder],
              ISNULL(re.EventSpeedDist, 0) AS [EventSpeedDistMi], -- Replace NULL with 0 for EventSpeedDist
              re.EventSpeedPostFix AS [EventSpeedPostFix],
              CASE WHEN re.EventIsEnabled = 'TRUE' THEN 1 ELSE 0 END AS [EventIsEnabled],
              CASE WHEN re.IsMultiLap = 'TRUE' THEN 1 ELSE 0 END AS [IsMultiLap]
          FROM
              [Racetek].[dbo].[RaceEvent] re
          WHERE
              re.RaceId = @race_id
          ORDER BY
              re.RaceId ASC,
              re.EventId ASC,
              re.EventOrder ASC;
      END
      ELSE
      BEGIN
          PRINT 'No race ID found.';
          -- Consider appropriate action if no race ID is found
      END;
    `);

    return result.recordset as EventTableData[];
  });

const pushEventsToRemoteDb = service()
  .input(z.array(EventTableSchema))
  .mutation(async ({ ctx, input }) => {
    const result = await ctx.mysqlRemoteDb.execute(
      `
      INSERT INTO \`dbo.RaceEvent\` (
        RaceId,
        EventId,
        EventDescr,
        WebName,
        EventOrder,
        EventSpeedDistMi,
        EventSpeedPostFix,
        EventIsEnabled,
        IsMultiLap
      )
      VALUES (
        :RaceId,
        :EventId,
        :EventDescr,
        :WebName,
        :EventOrder,
        :EventSpeedDistMi,
        :EventSpeedPostFix,
        :EventIsEnabled,
        :IsMultiLap
      )
      ON DUPLICATE KEY UPDATE
        EventDescr = VALUES(EventDescr),
        WebName = VALUES(WebName),
        EventOrder = VALUES(EventOrder),
        EventSpeedDistMi = VALUES(EventSpeedDistMi),
        EventSpeedPostFix = VALUES(EventSpeedPostFix),
        EventIsEnabled = VALUES(EventIsEnabled),
        IsMultiLap = VALUES(IsMultiLap);
    `,
      input,
    );

    return result;
  });

export const syncEvents = service().mutation(async ({ ctx }) => {
  const events = await pullEventsFromRacetec(ctx);
  const pushResult = await pushEventsToRemoteDb(ctx, events);
  return pushResult;
});
