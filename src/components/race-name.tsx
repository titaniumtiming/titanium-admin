"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc/react";
import { Pencil1Icon } from "@radix-ui/react-icons";
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

export interface RaceNameProps {}

export function RaceName(props: RaceNameProps) {
  const {} = props;

  const {
    data: defaultRaceDetails,
    isLoading,
    isError,
    isSuccess,
  } = api.getDefaultRaceDetails.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <div>
        <h1 className="px-2 text-3xl font-bold text-red-500">
          ERROR: YOU MUST SELECT A DEFAULT RACE IN RACETEC
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className=" text-muted-foreground">
        {defaultRaceDetails?.RaceDate}
      </div>
      <div className="flex gap-1">
        <h2 className="text-2xl font-bold tracking-tight">
          {defaultRaceDetails?.RaceName}({defaultRaceDetails?.RaceId})
        </h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Pencil1Icon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Default Race</DialogTitle>
            </DialogHeader>

            <div className="my-2 flex flex-col items-start gap-2">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                defaultValue={defaultRaceDetails?.RaceName}
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
    </div>
  );
}
