"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export interface SyncButtonProps {}

export function SyncButton(props: SyncButtonProps) {
  const {} = props;

  const [status, setStatus] = useState("idle");

  return (
    <>
      {/* <div className="flex items-center gap-1"> */}
      {/* <span>status = {status === "idle" ? "idle" : "active"}</span> */}

      <Button
        className="py-1"
        onClick={() => {
          setStatus((prev) => {
            if (prev === "idle") {
              return "pending";
            }
            return "idle";
          });
        }}
      >
        {status === "idle" ? "Start " : "Stop "}
        sync
      </Button>
      {/* </div> */}
    </>
  );
}
