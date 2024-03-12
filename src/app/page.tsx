import { AdminTable } from "@/components/admin-table";
import { EventsSelect } from "@/components/events-select";
import { RunAllOnceButton } from "@/components/run-all-once-button";
import { SyncButton } from "@/components/sync-button";

import { Button } from "@/components/ui/button";
import { Pencil1Icon } from "@radix-ui/react-icons";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center  ">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Race Name (ID)
            </h2>
            <Button variant="ghost" size="icon">
              <Pencil1Icon className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <EventsSelect />
            <RunAllOnceButton />

            <SyncButton />
          </div>
        </div>
        <AdminTable />
        {/* <div className="container mx-auto py-10">
        </div> */}
      </div>
    </main>
  );
}
