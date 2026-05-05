import "@/app/globals.css"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  CalendarDays, 
  Phone, 
  ShieldCheck, 
  Eye, 
  ArrowRight, 
  UserCircle,
  Search,
  Globe,
  Stethoscope
} from "lucide-react";

export default function CustomerHomePage() {
  return (
    <div className="flex flex-col w-full font-sans bg-slate-50">
      
      {/* 1. HEADER (Lấy cảm hứng từ Vinmec) */}
      <header className="w-full bg-white shadow-sm z-50 sticky top-0">
        {/* Tầng 1: Tiện ích & Ngôn ngữ */}
        <div className="hidden md:flex justify-end items-center px-8 py-2 bg-slate-100 text-sm text-slate-600 gap-6">
          <Link href="/customer-service" className="hover:text-blue-600 transition-colors">
            Chăm sóc khách hàng
          </Link>
          <Link href="/find-doctor" className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <Search className="w-3 h-3" /> Tìm bác sĩ
          </Link>
          <div className="flex items-center gap-2 border-l border-slate-300 pl-6">
            <Globe className="w-4 h-4 text-slate-500" />
            <span className="cursor-pointer hover:text-blue-600 font-medium">VN</span>
            <span className="text-slate-300">|</span>
            <span className="cursor-pointer hover:text-blue-600">EN</span>
          </div>
        </div>

        {/* Tầng 2: Menu chính */}
        <div className="flex justify-between items-center px-6 md:px-8 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Eye className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900 tracking-tight">VISIONCARE</span>
          </Link>

          <nav className="hidden lg:flex gap-8 font-medium text-slate-700">
            <Link href="/chuyen-khoa" className="hover:text-blue-600 transition-colors">Chuyên khoa</Link>
            <Link href="/huong-dan" className="hover:text-blue-600 transition-colors">Hướng dẫn khách hàng</Link>
            <Link href="/ve-chung-toi" className="hover:text-blue-600 transition-colors">Về VisionCare</Link>
            <Link href="/suc-khoe" className="hover:text-blue-600 transition-colors">Chuyên trang sức khoẻ</Link>
          </nav>

          <Link href="/auth/login">
            <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50 rounded-full px-6">
              <UserCircle className="mr-2 h-5 w-5" />
              Đăng nhập
            </Button>
          </Link>
        </div>
      </header>

      {/* 2. HERO BANNER & QUICK ACTIONS */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center z-10">
          <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-blue-500/20 border border-blue-400/50 text-sm font-medium mb-6 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4" /> Chăm sóc bằng tài năng, y đức và sự thấu cảm
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl leading-[1.15]">
            Hệ thống Y tế <br />
            <span className="text-blue-300">Chăm sóc sức khỏe đôi mắt hàng đầu</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl text-blue-100 mb-12 leading-relaxed font-light">
            Trải nghiệm dịch vụ khám chữa bệnh tiêu chuẩn quốc tế với đội ngũ chuyên gia nhãn khoa tận tâm và hệ thống trang thiết bị hiện đại.
          </p>
          
          {/* Box 3 Hành động chính giống Vinmec */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <Link href="tel:19001000" className="w-full">
              <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white w-full text-base font-semibold h-16 transition-all border-none flex flex-col items-center justify-center gap-1">
                <div className="flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-blue-300" /> Gọi tổng đài
                </div>
                <span className="text-xs font-light text-blue-100">Tư vấn và giải đáp</span>
              </Button>
            </Link>

            <Link href="/booking" className="w-full">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white w-full text-base font-semibold h-16 shadow-md transition-all border-none flex flex-col items-center justify-center gap-1 hover:scale-105">
                <div className="flex items-center">
                  <CalendarDays className="mr-2 h-5 w-5" /> Đặt Lịch Hẹn
                </div>
                <span className="text-xs font-light text-blue-100">Nhanh chóng, tiện lợi</span>
              </Button>
            </Link>

            <Link href="/find-doctor" className="w-full">
              <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white w-full text-base font-semibold h-16 transition-all border-none flex flex-col items-center justify-center gap-1">
                <div className="flex items-center">
                  <Stethoscope className="mr-2 h-5 w-5 text-blue-300" /> Tìm bác sĩ
                </div>
                <span className="text-xs font-light text-blue-100">Chuyên gia y tế hàng đầu</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. KHU VỰC TÍNH NĂNG NỔI BẬT */}
      <section className="py-20 bg-slate-50 max-w-7xl mx-auto px-4 w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Tại sao nên chọn VisionCare?</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">Chất lượng dịch vụ chuẩn quốc tế mang đến sự an tâm tuyệt đối cho đôi mắt của bạn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Stethoscope className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">Chuyên gia hàng đầu</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              VisionCare quy tụ đội ngũ chuyên gia, bác sĩ có trình độ chuyên môn cao, tận tâm và chuyên nghiệp, luôn đặt người bệnh làm trung tâm.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">Chất lượng quốc tế</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Được quản lý và vận hành dưới sự giám sát khắt khe, đảm bảo cung cấp dịch vụ chăm sóc sức khỏe mắt toàn diện và an toàn nhất.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Eye className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">Công nghệ tiên tiến</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Sở hữu cơ sở vật chất hạng nhất với các thiết bị đo khám thị lực và phẫu thuật nhập khẩu 100% từ Đức, Mỹ, Nhật Bản.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION - MUA KÍNH */}
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