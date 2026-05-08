// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from "@/components/providers/query-provider";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "Vision Care",
  description: "Vision Care Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}