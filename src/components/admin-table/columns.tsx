"use client";
import { format } from "date-fns";
import { Actions } from "@/components/admin-table/actions";
import { type Status, type Operation } from "@/components/admin-table/rows";
import { type ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import { StatusDisplay } from "@/components/status-display";

export const columns: ColumnDef<Operation>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Status;
      return (
        <div className="flex w-[100px] items-center">
          <StatusDisplay status={status} />
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "localDbItemsCount",
    header: "Local DB ",
  },
  {
    accessorKey: "remoteDbItemsCount",
    header: "Remote DB",
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
    cell: ({ row }) => {
      const formattedDate = format(row.getValue("lastUpdated"), "Pp");
      return <div className="">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "sqlSpeed",
    header: "SQL Speed",
  },
  {
    id: "actions",
    cell: ({ row }) => <Actions row={row} />,
  },
];

/**
 * - status
    - color to indicate
    - tooltip with extra info (fill later)
- local db name
    - just show "local db count" BUT also show edit icon
    - on edit, show the actula db name, and allow to change
- remote db name
    - ^^
- updated at
- sql speed
    - show warning based on durations compared to expected duration in config.json
- sync options
    - disabled
    - whichever is selected, show as the valueshow value + (duration ms) in brackets 
        - disable
        - normal interval
        - slow mode interval
        - custom interval
- force sync action
    - on click run sync query
    - useful for disabled intervals
- log 
    - for problem solving 
    - dont want full return value, overwhelming numbe of data
    - summary eg 
    - add more info later
    - store logs as a text file
        - useful for troubleshooting later
    - consider whether to store locally vs in remote db




- consider for later
    - on error, show desktop notification
        - maybe spam notifcations?
    - future also sms


- how do we know internet connection failure?
    - dont ping
    - just if a query error code says network error then send a notification
- on error change the status column specifically for that row
    - on hover/click show the actual error message

 */
