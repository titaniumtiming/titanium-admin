import { type Payment } from "@/components/admin-table/columns";

export const rows = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  // ...
] satisfies Payment[];
