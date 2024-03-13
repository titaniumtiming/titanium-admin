import { Button } from "@/components/ui/button";
import { Pencil1Icon } from "@radix-ui/react-icons";

export interface DatabaseHeaderCellProps {
  databaseLabel: "RaceTec" | "Remote";
  databaseTableName: string;
  onEditDatabaseName: () => void;
}

export function DatabaseHeaderCell(props: DatabaseHeaderCellProps) {
  const {} = props;

  return (
    <>
      <Button
        variant={"secondary"}
        size="sm"
        className="group mx-auto space-x-2 hover:bg-slate-200/60"
      >
        <span>{props.databaseLabel} DB</span>
        <Pencil1Icon
          className="group:hover:stroke-slate-800 h-3 w-3 stroke-slate-300 transition-colors duration-200
        "
        />
      </Button>
    </>
  );
}
