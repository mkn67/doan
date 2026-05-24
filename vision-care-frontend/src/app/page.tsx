import "@/app/globals.css";
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
  Stethoscope,
  Sparkles,
  Award,
  HeartHandshake,
  Activity,
  Glasses
} from "lucide-react";

export default function CustomerHomePage() {
  return (
    <div className="flex flex-col w-full font-sans bg-slate-50 text-slate-800 min-h-screen relative overflow-hidden">
      
      {/* Soft Ambient Light Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] bg-indigo-100/30 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] bg-emerald-100/20 rounded-full blur-[120px] pointer-events-none" />

      {/* 1. HEADER (Light Glassmorphic) */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/60 z-50 sticky top-0 shadow-sm">
        <div className="flex justify-between items-center px-6 md:px-12 py-4.5 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform duration-300">
              <Eye className="w-5.5 h-5.5 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-blue-700 via-indigo-800 to-blue-900 bg-clip-text text-transparent tracking-tight">
              VISIONCARE
            </span>
          </Link>

          <nav className="hidden lg:flex gap-10 font-bold text-xs uppercase tracking-wider text-slate-600">
            <Link href="/chuyen-khoa" className="hover:text-blue-600 transition-colors">Chuyên khoa</Link>
            <Link href="/ve-chung-toi" className="hover:text-blue-600 transition-colors">Về chúng tôi</Link>
            <Link href="/huong-dan" className="hover:text-blue-600 transition-colors">Hướng dẫn</Link>
            <Link href="/auth/login" className="hover:text-blue-600 transition-colors text-slate-400">Quản trị</Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <Globe className="w-4 h-4 text-slate-400" />
              <span className="cursor-pointer hover:text-blue-600 text-blue-600">VN</span>
              <span className="text-slate-300">|</span>
              <span className="cursor-pointer hover:text-blue-600">EN</span>
            </div>
            <Link href="/auth/login">
              <Button variant="outline" className="text-blue-600 border-blue-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-xl px-5 gap-2 font-bold transition-all shadow-sm">
                <UserCircle className="h-5 w-5 text-blue-500" />
                <span>Đăng nhập</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO BANNER & QUICK ACTIONS */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          
          {/* Top Intro Badge */}
          <span className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold uppercase tracking-widest text-blue-600 mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-500" /> Tiêu chuẩn y khoa - Đội ngũ chuyên gia
          </span>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-8 max-w-5xl leading-[1.1] text-slate-900">
            Ánh Sáng Khát Vọng <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent">Trọn Vẹn Niềm Tin</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg max-w-3xl text-slate-500 mb-12 leading-relaxed font-medium">
            Trải nghiệm dịch vụ khám chữa bệnh nhãn khoa tiêu chuẩn quốc tế. Quy tụ đội ngũ chuyên gia đầu ngành cùng trang thiết bị đo khám khúc xạ hiện đại nhất từ Đức và Mỹ.
          </p>
          
          {/* Quick Actions Panel (Bright White Card) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50">
            
            <Link href="/booking" className="w-full">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white w-full rounded-2xl h-20 px-5 flex items-center gap-4 transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-blue-500/20 cursor-pointer">
                <div className="p-3 bg-white/10 rounded-xl">
                  <CalendarDays className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-base font-bold">Đặt Lịch Hẹn Khám</p>
                  <p className="text-xs text-blue-100">Đặt lịch khám online nhanh chóng</p>
                </div>
              </div>
            </Link>

            <Link href="/chuyen-khoa" className="w-full">
              <div className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 w-full rounded-2xl h-20 px-5 flex items-center gap-4 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="text-base font-bold">Tìm Bác Sĩ Chuyên Khoa</p>
                  <p className="text-xs text-slate-500">Đội ngũ bác sĩ đầu ngành nhãn khoa</p>
                </div>
              </div>
            </Link>

            <Link href="tel:19009999" className="w-full">
              <div className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 w-full rounded-2xl h-20 px-5 flex items-center gap-4 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                  <Phone className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="text-base font-bold">Tổng Đài: 1900 9999</p>
                  <p className="text-xs text-slate-500">Tư vấn khẩn cấp và giải đáp thắc mắc</p>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* 3. CLINIC STATS BANNER */}
      <section className="border-y border-slate-200/80 bg-white relative z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-mono">15.000+</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Ca Khám Thành Công</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-mono">99%</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Bệnh Nhân Hài Lòng</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-mono">25+</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Bác Sĩ Đầu Ngành</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-mono">100%</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Thiết Bị Đức & Mỹ</p>
          </div>
        </div>
      </section>

      {/* 4. CLINIC ADVANTAGES */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Giá Trị Cốt Lõi</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900">Tại sao chọn VisionCare?</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base">Chúng tôi cam kết chất lượng chăm sóc sức khỏe mắt tối ưu với công nghệ và y đức.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 hover:border-blue-300 transition-all duration-300 group shadow-md hover:shadow-xl hover:shadow-blue-500/5">
            <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">Đội ngũ Chuyên Gia</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              Quy tụ các bác sĩ chuyên khoa mắt từng làm việc tại các bệnh viện lớn trung ương, giàu kinh nghiệm và liên tục cập nhật phác đồ điều trị quốc tế.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 hover:border-emerald-300 transition-all duration-300 group shadow-md hover:shadow-xl hover:shadow-emerald-500/5">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">Dịch Vụ Toàn Diện</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              Đáp ứng đầy đủ mọi nhu cầu từ đo khúc xạ kính thuốc, gia công mài lắp ráp tròng kính chất lượng cao cho đến điều trị đục thủy tinh thể, glaucoma.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 hover:border-indigo-300 transition-all duration-300 group shadow-md hover:shadow-xl hover:shadow-indigo-500/5">
            <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <Activity className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">Hạ Tầng Hiện Đại</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              Đầu tư 100% trang thiết bị đo mắt, máy mài tròng kính kỹ thuật số nhập khẩu từ các tập đoàn hàng đầu thế giới (Zeiss Đức, Essilor Pháp).
            </p>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION - GLASSES WORKSHOP (High Contrast Medical Blue Card) */}
      <section className="py-16 mb-16 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative flex flex-col lg:flex-row items-center justify-between bg-gradient-to-r from-blue-700 to-indigo-800 border border-blue-800 p-8 md:p-14 rounded-3xl shadow-2xl overflow-hidden text-white">
            {/* Decal Background Eye Icon */}
            <div className="absolute right-[-5%] bottom-[-15%] text-white/5 pointer-events-none">
              <Glasses className="w-80 h-80 rotate-12" />
            </div>
            
            <div className="mb-8 lg:mb-0 relative z-10 space-y-3 text-left">
              <span className="text-xs font-black uppercase text-white tracking-widest bg-white/10 border border-white/20 px-3 py-1 rounded-md">
                Gian hàng Nhãn Khoa
              </span>
              <h2 className="text-3xl font-black text-white">Bạn đang cần cắt kính cận, viễn hay loạn thị?</h2>
              <p className="text-blue-100 text-sm md:text-base max-w-xl">
                Khám phá ngay bộ sưu tập gọng kính thời trang cao cấp kết hợp với tròng kính chống ánh sáng xanh, chống lóa chuẩn y khoa của chúng tôi.
              </p>
            </div>
            
            <Link href="/ve-chung-toi" className="relative z-10 w-full lg:w-auto flex-shrink-0">
              <Button className="bg-white hover:bg-slate-100 text-blue-800 rounded-xl px-8 h-14 w-full lg:w-auto text-base font-bold shadow-lg transition-all duration-300">
                Tìm hiểu về Sản Phẩm <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. PARTNERS LOGO */}
      <section className="py-10 border-t border-slate-200 bg-white relative z-10 text-center">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Đối Tác Tròng Kính & Trang Thiết Bị Chính Thức</p>
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-45 grayscale hover:opacity-75 transition-opacity duration-300">
          <span className="text-lg font-black tracking-wider text-slate-700">ZEISS</span>
          <span className="text-lg font-black tracking-wider text-slate-700">ESSILOR</span>
          <span className="text-lg font-black tracking-wider text-slate-700">HOYA</span>
          <span className="text-lg font-black tracking-wider text-slate-700">RODENSTOCK</span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 py-12 text-slate-400 text-xs text-center border-t border-slate-800 relative z-10">
        <p className="font-bold text-slate-300 text-sm">VISION CARE EYE CLINIC SYSTEM</p>
        <p className="mt-2 text-slate-500">© 2026 VisionCare. Bảo lưu mọi quyền.</p>
        <p className="mt-1 text-slate-500">Địa chỉ: 123 Đường Tôn Đức Thắng, Quận 1, TP.HCM | Hotline: 1900 9999</p>
      </footer>
    </div>
  );
}