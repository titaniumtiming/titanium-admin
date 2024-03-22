import { SyncDbTableName } from "@/schemas";
const seconds = 1000;

export const syncDbTableNameToInterval = {
  AthleteResults: {
    default: 15 * seconds,
    slow: 30 * seconds,
  },
  AthleteSplits: {
    default: 20 * seconds,
    slow: 40 * seconds,
  },
  Athletes: {
    default: 10 * seconds,
    slow: 15 * seconds,
  },
  Events: {
    default: 40 * seconds,
    slow: 50 * seconds,
  },
  PrimaryCategories: {
    default: 15 * seconds,
    slow: 30 * seconds,
  },
  SecondaryCategories: {
    default: 15 * seconds,
    slow: 30 * seconds,
  },
  Races: {
    default: 15 * seconds,
    slow: 30 * seconds,
  },
  Splits: {
    default: 15 * seconds,
    slow: 30 * seconds,
  },
} satisfies Record<SyncDbTableName, { default: number; slow: number }>;
export const MAX_DELETE_COUNT = 10;
