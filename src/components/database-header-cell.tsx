import { Button } from "@/components/ui/button";
import { Pencil1Icon, ReloadIcon } from "@radix-ui/react-icons";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogClose } from "@radix-ui/react-dialog";
import { api } from "@/lib/trpc/react";
import { toast } from "sonner";

export interface DatabaseHeaderCellProps {
  databaseLabel: "RaceTec" | "Remote";
  databaseTableName: string;
  onEditDatabaseName: () => void;
}
export function DatabaseHeaderCell(props: DatabaseHeaderCellProps) {
  const {} = props;

  const { mutateAsync: ping } = api.ping.useMutation();

  return (
    <div className="flex items-center justify-center p-1">
      <Button
        size="icon"
        variant="outline"
        className="mr-1 rounded-full"
        onClick={() => {
          toast.promise(
            ping({
              type: props.databaseLabel,
            }),
            {
              loading: `Pinging ${props.databaseLabel} database...`,
              success: `${props.databaseLabel} database pinged successfully`,
              error: `Failed to ping ${props.databaseLabel} database`,
            },
          );
        }}
      >
        <span className="text-sm">ping</span>
      </Button>
      <span>{props.databaseLabel} DB</span>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant={"ghost"}
            size="sm"
            className="inline-flex flex-col  hover:bg-slate-200/60"
          >
            <Pencil1Icon
              className="group:hover:stroke-slate-800 h-3 w-3 stroke-slate-300 transition-colors duration-200
        "
            />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit {props.databaseLabel} Database Name</DialogTitle>
          </DialogHeader>

          <div className="my-2 flex flex-col items-start gap-2">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              defaultValue="The database name"
              className=""
              autoFocus
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
