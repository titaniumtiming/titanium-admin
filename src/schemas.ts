import { z } from "zod";

export const RaceTableSchema = z.object({
  RaceId: z.number(),
  RaceName: z.string(),
  WebName: z.string(),
  RaceGroupingId: z.number(),
  RaceDate: z.string(),
  RaceYear: z.number(),
  RoundingTypeId: z.number(),
  NetTimeRoundingTypeId: z.number(),
  FinishTimePrec: z.number(),
  NetTimePrec: z.number(),
  RaceLocation: z.string(),
  IsEnabled: z.number(),
  TitleCaseSettings: z.null().optional(),
  OrganiserId: z.number(),
  LiveResults: z.number(),
  ResultsRedirect: z.number(),
  ResultsRedirectUrl: z.string().nullable().optional(),
  RaceWebsite: z.string().nullable().optional(),
  RaceTwitter: z.string().nullable().optional(),
  RaceInstagram: z.string().nullable().optional(),
  RaceFacebook: z.string().nullable().optional(),
});

export type RaceTableData = z.infer<typeof RaceTableSchema>;
