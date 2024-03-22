import { convertUndefinedToNull } from "@/lib/utils";
import { z } from "zod";

export const RaceTableSchema = z
  .object({
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
    RaceLocation: z.string().nullable(),
    IsEnabled: z.number(),
    TitleCaseSettings: z.null().optional().nullable(),
    OrganiserId: z.number().optional().nullable(),
    LiveResults: z.number().nullable(),
    ResultsRedirect: z.number().nullable(),
    ResultsRedirectUrl: z.string().nullable().optional(),
    RaceWebsite: z.string().nullable().optional(),
    RaceTwitter: z.string().nullable().optional(),
    RaceInstagram: z.string().nullable().optional(),
    RaceFacebook: z.string().nullable().optional(),
  })
  .transform(convertUndefinedToNull);

export type RaceTableData = z.infer<typeof RaceTableSchema>;
export const statusSchema = z.enum(["idle", "pending", "success", "error"]);

export type Status = z.infer<typeof statusSchema>;

export const syncDbTableNameSchema = z.enum([
  "Races",
  "Events",
  "Splits",
  "PrimaryCategories",
  "SecondaryCategories",
  "Athletes",
  "AthleteResults",
  "AthleteSplits",
]);

export type SyncDbTableName = z.infer<typeof syncDbTableNameSchema>;

export const syncTableOperationSchema = z.object({
  id: z.string(),
  dbTableName: syncDbTableNameSchema,
  status: statusSchema,
  lastUpdated: z.date(),
  sqlSpeed: z.number(),
  localDbItemsCount: z.number(),
  remoteDbItemsCount: z.number(),
});
export type Operation = z.infer<typeof syncTableOperationSchema>;
