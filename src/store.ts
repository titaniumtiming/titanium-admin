import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {} from "@redux-devtools/extension"; // required for devtools typing
import { SyncDbTableName } from "@/schemas";

interface GlobalStore {
  syncEnabled: boolean;
  enableSync: () => void;
  disableSync: () => void;
  selectedEvents: string[];
  setSelectedEvents: (events: string[]) => void;
  syncTableDbNameToLastSyncedAt: Partial<Record<SyncDbTableName, Date>>;
}

export const eventsData = [
  {
    label: "Event 1",
    value: "event-1",
  },
  {
    label: "Event 2",
    value: "event-2",
  },
  {
    label: "Event 3",
    value: "event-3",
  },
];

export const useGlobalStore = create<GlobalStore>()(
  devtools(
    persist(
      (set) => ({
        syncEnabled: false,
        enableSync: () => set({ syncEnabled: true }),
        disableSync: () => set({ syncEnabled: false }),
        selectedEvents: [],
        setSelectedEvents: (events: string[]) =>
          set({ selectedEvents: events }),
        syncTableDbNameToLastSyncedAt: {},
      }),
      {
        name: "global-store",
      },
    ),
  ),
);

export function useLastSyncedAt(dbTableName: SyncDbTableName) {
  const lastSyncedAt = useGlobalStore(
    (state) => state.syncTableDbNameToLastSyncedAt[dbTableName],
  );
  return lastSyncedAt;
}

export function setLastSyncedAt(
  dbTableName: SyncDbTableName,
  newDate = new Date(),
) {
  return useGlobalStore.setState((prev) => {
    return {
      ...prev,
      syncTableDbNameToLastSyncedAt: {
        ...prev.syncTableDbNameToLastSyncedAt,
        [dbTableName]: newDate,
      },
    };
  });
}
