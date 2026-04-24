// BẮT BUỘC phải có dòng này ở trên cùng nhé!
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Dùng useState để đảm bảo mỗi user có một QueryClient riêng biệt, không bị lộn data
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Data sẽ "cũ" sau 1 phút (tùy ông chỉnh)
            refetchOnWindowFocus: false, // Tắt cái trò tự động fetch lại khi chuyển tab
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}