import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 1. Import cái Provider vào đây (dùng Alias @/ cho chuyên nghiệp)
import QueryProvider from "@/components/providers/query-provider"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 2. Bonus: Sửa luôn cái Title cho chuẩn đồ án nhé
export const metadata: Metadata = {
  title: "VisionCare - Hệ thống quản lý phòng khám",
  description: "Giải pháp quản lý phòng khám mắt chuyên nghiệp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi" // Sửa thành vi cho chuẩn tiếng Việt
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* 3. Bọc cái QueryProvider quanh children */}
        <QueryProvider>
           {children}
        </QueryProvider>
      </body>
    </html>
  );
}