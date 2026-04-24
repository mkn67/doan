import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, Phone, ShieldCheck, Eye, ArrowRight, Clock } from "lucide-react";

export default function CustomerHomePage() {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* 1. HERO BANNER - Trái tim của trang web */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-28 flex flex-col items-start z-10">
          <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-blue-500/20 border border-blue-400/50 text-sm font-medium mb-6 backdrop-blur-sm">
            <Eye className="w-4 h-4" /> Tiên phong nhãn khoa - Vươn xa quốc tế
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-3xl leading-[1.15]">
            Vì sự nghiệp chăm sóc và <br />
            <span className="text-blue-300">Bảo vệ sức khỏe đôi mắt</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl text-blue-100 mb-10 leading-relaxed font-light">
            Hệ thống quản lý phòng khám hiện đại, giúp bạn dễ dàng đặt lịch, tra cứu hồ sơ và trải nghiệm dịch vụ chăm sóc mắt tiêu chuẩn quốc tế.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/booking" className="w-full sm:w-auto">
              <Button size="lg" className="bg-white text-blue-800 hover:bg-gray-100 w-full text-base font-bold h-14 px-8 shadow-md transition-all hover:scale-105">
                <CalendarDays className="mr-2 h-5 w-5" />
                Đặt Lịch Khám Ngay
              </Button>
            </Link>
            <Link href="tel:19001000" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10 w-full text-base h-14 px-8 backdrop-blur-sm transition-all">
                <Phone className="mr-2 h-5 w-5" />
                Hotline: 1900 1000
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. KHU VỰC TÍNH NĂNG NỔI BẬT */}
      <section className="py-20 bg-slate-50 relative -mt-8 z-20 rounded-t-3xl max-w-7xl mx-auto px-4 w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Tại sao chọn VisionCare?</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">Chất lượng dịch vụ hàng đầu mang đến sự an tâm tuyệt đối cho đôi mắt của bạn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">Đội ngũ chuyên gia</h3>
            <p className="text-slate-600 leading-relaxed">
              Các y bác sĩ đầu ngành có nhiều năm kinh nghiệm, luôn tận tâm với sứ mệnh mang lại ánh sáng cho cộng đồng.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Eye className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">Trang thiết bị hiện đại</h3>
            <p className="text-slate-600 leading-relaxed">
              Nhập khẩu 100% các thiết bị đo khám thị lực và phẫu thuật tiên tiến nhất từ Đức, Mỹ, Nhật Bản.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">Quy trình nhanh chóng</h3>
            <p className="text-slate-600 leading-relaxed">
              Hệ thống đặt lịch trực tuyến thông minh giúp bạn không cần phải xếp hàng chờ đợi, tối ưu thời gian khám.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CALL TO ACTION - MUA KÍNH */}
      <section className="py-16 mb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-10 md:p-14 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden">
            {/* Decal trang trí */}
            <div className="absolute -right-10 -top-10 text-blue-100/50">
              <Eye className="w-64 h-64" />
            </div>
            
            <div className="mb-8 md:mb-0 relative z-10">
              <h2 className="text-3xl font-bold text-blue-950 mb-3">Bạn cần cắt kính cận/viễn?</h2>
              <p className="text-blue-800/80 text-lg">Khám phá bộ sưu tập gọng kính thời trang và tròng kính chất lượng cao ngay hôm nay.</p>
            </div>
            <Link href="/products" className="relative z-10 w-full md:w-auto">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 h-14 w-full text-base shadow-lg shadow-blue-200">
                Xem gian hàng kính <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}