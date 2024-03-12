import { api } from "@/lib/trpc/react";
import { z } from "zod";
export const statusSchema = z.enum(["idle", "pending", "success", "error"]);

export type Status = z.infer<typeof statusSchema>;

const operationTitleSchema = z.enum([
  "Races",
  "Events",
  "Splits",
  "Primary Cat",
  "Secondary Cat",
  "Athletes",
  "Athlete Results",
  "Athlete Splits",
]);

export type OperationTitle = z.infer<typeof operationTitleSchema>;

export const operationSchema = z.object({
  id: z.string(),
  title: operationTitleSchema,
  status: statusSchema,
  lastUpdated: z.date(),
  sqlSpeed: z.number(),
  localDbItemsCount: z.number(),
  remoteDbItemsCount: z.number(),
});

export const operationToApi = (
  operationTitle: OperationTitle,
): typeof api.syncRaces.useQuery => {
  /**
   * current only upload races & events
   * rest are implemented with racetec
   */
  if (operationTitle === "Races") return api.syncRaces.useQuery;
  if (operationTitle === "Events") return api.syncEvents.useQuery;
  if (operationTitle === "Splits") return api.syncRaces.useQuery;
  if (operationTitle === "Primary Cat") return api.syncRaces.useQuery;
  if (operationTitle === "Secondary Cat") return api.syncRaces.useQuery;
  if (operationTitle === "Athletes") return api.syncRaces.useQuery;
  /**
   * start with athlete results first (WORST ONE)
   */
  if (operationTitle === "Athlete Results") return api.syncRaces.useQuery;
  if (operationTitle === "Athlete Splits") return api.syncRaces.useQuery;

  throw new Error(`Unknown operation title: ${operationTitle}`);
};

export type Operation = z.infer<typeof operationSchema>;

export const operations = [
  {
    id: "1",
    title: "Races",
    status: "success",
    lastUpdated: new Date("2023-06-10T09:51:00"),
    sqlSpeed: 69.51,
    localDbItemsCount: 1,
    remoteDbItemsCount: 1,
  },
  {
    id: "2",
    title: "Events",
    status: "success",
    lastUpdated: new Date("2023-06-10T09:51:00"),
    sqlSpeed: 69.51,
    localDbItemsCount: 3,
    remoteDbItemsCount: 3,
  },
  {
    id: "3",
    title: "Primary Cat",
    status: "success",
    lastUpdated: new Date("2023-06-10T10:20:00"),
    sqlSpeed: 10.2,
    localDbItemsCount: 20,
    remoteDbItemsCount: 15,
  },
  {
    id: "4",
    title: "Secondary Cat",
    status: "success",
    lastUpdated: new Date("2023-06-10T10:24:00"),
    sqlSpeed: 10.24,
    localDbItemsCount: 0,
    remoteDbItemsCount: 0,
  },
  {
    id: "5",
    title: "Athletes",
    status: "idle",
    lastUpdated: new Date("2023-06-10T11:04:00"),
    sqlSpeed: 11.04,
    localDbItemsCount: 2500,
    remoteDbItemsCount: 2500,
  },
  {
    id: "6",
    title: "Athlete Results",
    status: "pending",
    lastUpdated: new Date("2023-06-10T12:00:00"),
    sqlSpeed: 12.0,
    localDbItemsCount: 2500,
    remoteDbItemsCount: 2400,
  },
  {
    id: "7",
    title: "Athlete Splits",
    status: "error",
    lastUpdated: new Date("2023-06-10T12:00:00"),
    sqlSpeed: 12.0,
    localDbItemsCount: 10000,
    remoteDbItemsCount: 9800,
  },
] satisfies Operation[];
