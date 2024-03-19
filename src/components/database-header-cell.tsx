import { Button } from "@/components/ui/button";
import { Pencil1Icon } from "@radix-ui/react-icons";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/trpc/react";
import { DialogClose } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import React from "react";

export interface DatabaseHeaderCellProps {
  databaseLabel: "RaceTec" | "Remote";
  databaseTableName: string;
  onEditDatabaseName: () => void;
}
export function DatabaseHeaderCell(props: DatabaseHeaderCellProps) {
  const {} = props;

  const [response, setResponse] = React.useState<any>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { mutateAsync: ping } = api.ping.useMutation({
    onSuccess: (data) => {
      setResponse(data);
    },
    onError: (error) => {
      setResponse(error);
    },
  });

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
              dismissible: true,
              duration: 3000,
              loading: `Pinging ${props.databaseLabel} database...`,
              success: `${props.databaseLabel} database pinged successfully`,
              error: (e) =>
                `Failed to ping ${props.databaseLabel} database: ${e.message}`,
            },
          );
        }}
      >
        <span className="text-sm">ping</span>
      </Button>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
        }}
      >
        {/* <DialogTrigger>Open</DialogTrigger> */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync all details:</DialogTitle>
            {/* <DialogDescription> */}

            <pre>{JSON.stringify(response, null, 2)}</pre>
            {/* </DialogDescription> */}
          </DialogHeader>
        </DialogContent>
      </Dialog>
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
