import { SyncDbTableName } from "@/components/admin-table/rows";

const seconds = 1000;

export const syncDbTableNameToInterval = {
  "Athlete Results": {
    default: 15 * seconds,
    slow: 30 * seconds,
  },
  "Athlete Splits": {
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
  "Primary Cat": {
    default: 15 * seconds,
    slow: 30 * seconds,
  },
  "Secondary Cat": {
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
