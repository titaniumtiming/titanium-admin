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

import {
  DialogDescription,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "date-fns";
import { useMemo } from "react";
import { NextSyncAt } from "@/components/admin-table/next-sync-at";

export function Actions(props: ActionsProps) {
  const { row } = props;

  const operation = syncTableOperationSchema.parse(row.original);

  const { runSyncOperation, status, lastRunDuration, logs, endedAt } =
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

        <div className="flex items-center gap-1">
          <NextSyncAt lastSyncedAt={endedAt} syncInterval={syncInterval} />

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

        <Dialog>
          <DialogTrigger asChild>
            <Button variant={"secondary"}>Log</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Details:</DialogTitle>
            </DialogHeader>
            {logs.map((log, i) => {
              return (
                <>
                  <div
                    key={i + operation.dbTableName + log.date.toISOString()}
                    className="flex flex-col text-center sm:text-left"
                  >
                    <div className="flex items-center justify-between">
                      {log.status === "success" ? (
                        <span className="text-green-700">
                          {logs.length - i}. Success
                        </span>
                      ) : (
                        <span className="text-red-700">
                          {logs.length - i}. Error
                        </span>
                      )}

                      <span className="text-muted-foreground">
                        {formatDate(log.date, "Pp")} (Duration =
                        {(log.duration / 1000).toFixed(1)}s )
                      </span>
                    </div>

                    <pre>{log.message}</pre>
                  </div>
                  <hr />
                </>
              );
            })}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
