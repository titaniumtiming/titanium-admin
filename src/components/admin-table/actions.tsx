import { operationSchema, type Operation } from "@/components/admin-table/rows";
import { Button } from "@/components/ui/button";
import { type Row } from "@tanstack/react-table";

export interface ActionsProps {
  row: Row<Operation>;
}

export function Actions(props: ActionsProps) {
  const { row } = props;
  const operation = operationSchema.parse(row.original);

  return (
    <>
      <Button variant={"secondary"}>Interval</Button>
      <Button variant={"secondary"}>Run Sync</Button>
      <Button variant={"secondary"}>Log</Button>
    </>
  );
}
