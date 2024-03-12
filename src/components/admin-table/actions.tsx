"use client";
import {
  operationSchema,
  operationToApi,
  type Operation,
} from "@/components/admin-table/rows";
import { IntervalSelect } from "@/components/interval-select";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc/react";
import { type Row } from "@tanstack/react-table";

export interface ActionsProps {
  row: Row<Operation>;
}

export function Actions(props: ActionsProps) {
  const { row } = props;
  const operation = operationSchema.parse(row.original);

  const operationApi = operationToApi(operation.title);
  if (!operationApi) {
    throw new Error(`Unknown operation title: ${operation.title}`);
  }

  // api.syncEvents.useQuery(undefined, {
  //   enabled: false,
  // });

  // console.log(operation, operationApi);

  const {} = operationApi(undefined, {
    enabled: false,
  });

  return (
    <>
      <div className="flex gap-1">
        <IntervalSelect operation={operation} />
        <Button variant={"secondary"}>Log</Button>
      </div>
    </>
  );
}
