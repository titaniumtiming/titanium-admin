"use client";

import { IntervalSelect } from "@/components/interval-select";
import { StatusDisplay } from "@/components/status-display";
import { Button } from "@/components/ui/button";
import { useRunSyncOperation } from "@/lib/use-run-sync-operation";
import { useRunSyncOperationAtInterval } from "@/lib/use-run-sync-operation-at-interval";
import { Operation, syncTableOperationSchema } from "@/schemas";
import { type Row } from "@tanstack/react-table";

export interface ActionsProps {
  row: Row<Operation>;
}

export function Actions(props: ActionsProps) {
  const { row } = props;

  const operation = syncTableOperationSchema.parse(row.original);

  const { runSyncOperation, status, lastRunDuration, log } =
    useRunSyncOperation({
      operation,
    });

  const { setSyncInterval, syncInterval } = useRunSyncOperationAtInterval({
    dbTableName: operation.dbTableName,
    runSyncOperation,
  });

  return (
    <>
      <div className="flex items-center gap-1">
        <IntervalSelect
          onRun={runSyncOperation}
          dbTableName={operation.dbTableName}
          setSyncInterval={setSyncInterval}
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <StatusDisplay
              status={status}
              className="mx-1 min-w-[110px] flex-1 items-center justify-center"
            >
              {(status === "success" || status === "error") &&
                lastRunDuration && (
                  <span>({(lastRunDuration / 1000).toFixed(1)}s)</span>
                )}
            </StatusDisplay>
          </div>
        </div>
        <Button
          variant={"secondary"}
          onClick={() => {
            console.log("log", log);
          }}
        >
          Log
        </Button>
      </div>
    </>
  );
}
