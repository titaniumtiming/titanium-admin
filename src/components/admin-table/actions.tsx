import { operationSchema, type Operation } from "@/components/admin-table/rows";
import { IntervalSelect } from "@/components/interval-select";
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
      <div className="flex gap-1">
        <IntervalSelect />
        <Button variant={"secondary"}>Log</Button>
      </div>
    </>
  );
}
