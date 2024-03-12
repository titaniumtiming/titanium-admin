import { api } from "@/lib/trpc/react";
import { z } from "zod";
export const statusSchema = z.enum(["idle", "pending", "success", "error"]);

export type Status = z.infer<typeof statusSchema>;

const syncDbTableNameSchema = z.enum([
  "Races",
  "Events",
  "Splits",
  "Primary Cat",
  "Secondary Cat",
  "Athletes",
  "Athlete Results",
  "Athlete Splits",
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

export const operationToApi = (
  dbTableName: SyncDbTableName,
): typeof api.syncRaces.useMutation => {
  /**
   * current only upload races & events
   * rest are implemented with racetec
   */
  if (dbTableName === "Races") return api.syncRaces.useMutation;
  if (dbTableName === "Events") return api.syncEvents.useMutation;
  if (dbTableName === "Splits") return api.syncRaces.useMutation;
  if (dbTableName === "Primary Cat") return api.syncRaces.useMutation;
  if (dbTableName === "Secondary Cat") return api.syncRaces.useMutation;
  if (dbTableName === "Athletes") return api.syncRaces.useMutation;
  /**
   * start with athlete results first (WORST ONE)
   */
  if (dbTableName === "Athlete Results") return api.syncRaces.useMutation;
  if (dbTableName === "Athlete Splits") return api.syncRaces.useMutation;

  throw new Error(`Unknown operation dbTableName: ${dbTableName}`);
};

export type Operation = z.infer<typeof syncTableOperationSchema>;

export const operations = [
  {
    id: "1",
    dbTableName: "Races",
    status: "success",
    lastUpdated: new Date("2023-06-10T09:51:00"),
    sqlSpeed: 69.51,
    localDbItemsCount: 1,
    remoteDbItemsCount: 1,
  },
  {
    id: "2",
    dbTableName: "Events",
    status: "success",
    lastUpdated: new Date("2023-06-10T09:51:00"),
    sqlSpeed: 69.51,
    localDbItemsCount: 3,
    remoteDbItemsCount: 3,
  },
  {
    id: "3",
    dbTableName: "Primary Cat",
    status: "success",
    lastUpdated: new Date("2023-06-10T10:20:00"),
    sqlSpeed: 10.2,
    localDbItemsCount: 20,
    remoteDbItemsCount: 15,
  },
  {
    id: "4",
    dbTableName: "Secondary Cat",
    status: "success",
    lastUpdated: new Date("2023-06-10T10:24:00"),
    sqlSpeed: 10.24,
    localDbItemsCount: 0,
    remoteDbItemsCount: 0,
  },
  {
    id: "5",
    dbTableName: "Athletes",
    status: "idle",
    lastUpdated: new Date("2023-06-10T11:04:00"),
    sqlSpeed: 11.04,
    localDbItemsCount: 2500,
    remoteDbItemsCount: 2500,
  },
  {
    id: "6",
    dbTableName: "Athlete Results",
    status: "pending",
    lastUpdated: new Date("2023-06-10T12:00:00"),
    sqlSpeed: 12.0,
    localDbItemsCount: 2500,
    remoteDbItemsCount: 2400,
  },
  {
    id: "7",
    dbTableName: "Athlete Splits",
    status: "error",
    lastUpdated: new Date("2023-06-10T12:00:00"),
    sqlSpeed: 12.0,
    localDbItemsCount: 10000,
    remoteDbItemsCount: 9800,
  },
] satisfies Operation[];
