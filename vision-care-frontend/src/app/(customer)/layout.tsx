// app/customer/layout.tsx
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="customer-layout">
      {/* Ví dụ thêm header riêng cho customer */}
      {children}
    </div>
  );
}