// app/layout.tsx
import type { Metadata } from "next";
import { ReactNode } from "react";
import QueryProvider from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "Vision Care",
  description: "Vision Care Management System",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}