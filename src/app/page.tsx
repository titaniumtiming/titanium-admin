import { AdminTable, columns } from "@/components/admin-table";
import { api } from "@/trpc/server";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center  text-white">
      <div className="container mx-auto py-10">
        <AdminTable />
      </div>
    </main>
  );
}
