"use client";
import { operationToApi, type Operation } from "@/components/admin-table/rows";
import { setLastSyncedAt } from "@/store";
import { useMemo, useState } from "react";

export type UseRunSyncOperationProps = {
  operation: Operation;
};

export function useRunSyncOperation(props: UseRunSyncOperationProps) {
  const { operation } = props;
  const [log, setLog] = useState<string[]>([]);

  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [endedAt, setEndedAt] = useState<Date | null>(null);

  const lastRunDuration = useMemo(() => {
    if (!endedAt || !startedAt) return null;

    return endedAt.getTime() - startedAt.getTime();
  }, [endedAt, startedAt]);

  const operationApi = operationToApi(operation.dbTableName);

  const { mutateAsync, status } = operationApi({});

  // time how long it takes to run the operation
  //  save when it was last run
  //  save the return time of the operation in a log
  const runSyncOperation = async () => {
    const startedAt = new Date();
    setStartedAt(startedAt);
    try {
      const result = await mutateAsync();
      const endedAt = new Date();
      setEndedAt(endedAt);
      setLastSyncedAt(operation.dbTableName, endedAt);
      setLog((prev) => [
        JSON.stringify(result, null, 2),
        ...prev,

        // `Ran operation at ${startedAt.toISOString()} and finished at ${endedAt.toISOString()}`,
      ]);
      return result;
    } catch (error) {
      const endedAt = new Date();
      setEndedAt(endedAt);
      setLastSyncedAt(operation.dbTableName, endedAt);
      setLog((prev) => [
        ...prev,
        `Ran operation at ${startedAt.toISOString()} and finished at ${endedAt.toISOString()} with error: ${(error as any)?.message ?? error ?? "unknown"}`,
      ]);
      throw error;
    }
  };

  return {
    runSyncOperation,
    log,
    lastRunDuration,
    status,
  };
}
