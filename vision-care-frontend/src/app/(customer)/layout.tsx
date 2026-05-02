import CustomerHeader from "@/components/customer/CustomerHeader"; // Chứa Logo và Menu của khách
import CustomerFooter from "@/components/customer/CustomerFooter"; // Chứa địa chỉ, hotline phòng khám

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      {/* 1. Header luôn nằm trên cùng ở mọi trang của Khách */}
      <CustomerHeader />

      {/* 2. Nội dung từng trang (Booking, Profile, Products...) sẽ đổ vào đây */}
      <main className="flex-grow container mx-auto p-4">
        {children} 
      </main>

      {/* 3. Footer luôn nằm dưới cùng */}
      <CustomerFooter />
      
    </div>
  );
}