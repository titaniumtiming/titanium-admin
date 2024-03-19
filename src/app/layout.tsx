import "@/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "@/lib/trpc/react";
import { Toaster } from "@/components/ui/sonner";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Titanium Racing Admin Dashboard",
  description: "Admin dashboard for Titanium Racing ",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster richColors theme="light" toastOptions={{}} />
      </body>
    </html>
  );
}
