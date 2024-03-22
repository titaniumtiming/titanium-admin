import { api } from "@/lib/trpc/react";
import {
  Operation,
  SyncDbTableName,
  syncDbTableNameSchema,
  syncTableOperationSchema,
} from "@/schemas";
import { z } from "zod";

export const operationToApi = (
  dbTableName: SyncDbTableName,
): typeof api.sync.Races.useMutation => {
  const parsedName = syncDbTableNameSchema.parse(dbTableName);

  const mutationHook = api.sync[parsedName].useMutation;

  if (!mutationHook) {
    throw new Error(`No mutation hook found for ${parsedName}`);
  }

  return mutationHook;
};

export const operations = [
  {
    id: "1",
    dbTableName: "Races",
    status: "success",
    lastUpdated: new Date("2023-06-10T09:51:00"),
    sqlSpeed: 69.51,
    localDbItemsCount: "",
    remoteDbItemsCount: "",
  },
  {
    id: "2",
    dbTableName: "Events",
    status: "success",
    lastUpdated: new Date("2023-06-10T09:51:00"),
    sqlSpeed: 69.51,
    localDbItemsCount: "",
    remoteDbItemsCount: "",
  },
  {
    id: "55",
    dbTableName: "Splits",
    status: "success",
    lastUpdated: new Date("2023-06-10T09:51:00"),
    sqlSpeed: 69.51,
    localDbItemsCount: "",
    remoteDbItemsCount: "",
  },
  {
    id: "3",
    dbTableName: "PrimaryCategories",
    status: "success",
    lastUpdated: new Date("2023-06-10T10:20:00"),
    sqlSpeed: 10.2,
    localDbItemsCount: "",
    remoteDbItemsCount: "",
  },
  {
    id: "4",
    dbTableName: "SecondaryCategories",
    status: "success",
    lastUpdated: new Date("2023-06-10T10:24:00"),
    sqlSpeed: 10.24,
    localDbItemsCount: "",
    remoteDbItemsCount: "",
  },
  {
    id: "5",
    dbTableName: "Athletes",
    status: "idle",
    lastUpdated: new Date("2023-06-10T11:04:00"),
    sqlSpeed: 11.04,
    localDbItemsCount: "",
    remoteDbItemsCount: "",
  },
  {
    id: "6",
    dbTableName: "AthleteResults",
    status: "pending",
    lastUpdated: new Date("2023-06-10T12:00:00"),
    sqlSpeed: 12.0,
    localDbItemsCount: "",
    remoteDbItemsCount: "",
  },
  {
    id: "7",
    dbTableName: "AthleteSplits",
    status: "error",
    lastUpdated: new Date("2023-06-10T12:00:00"),
    sqlSpeed: 12.0,
    localDbItemsCount: "",
    remoteDbItemsCount: "",
  },
] satisfies Operation[];
