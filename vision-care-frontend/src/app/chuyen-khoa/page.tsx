"use client";

import React from "react";
import Link from "next/link";
import { 
  Eye, 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Stethoscope,
  ArrowRight,
  ChevronRight,
  BookOpen,
  CalendarDays,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

const specialties = [
  {
    id: "Refraction",
    name: "Khúc xạ Nhãn khoa (Optometry)",
    description: "Đo khám khúc xạ, tầm soát cận - viễn - loạn thị, thử kính và tư vấn các loại tròng kính chống ánh sáng xanh, chống lóa chuẩn y khoa.",
    icon: Eye,
    color: "text-blue-600 bg-blue-50 border-blue-100",
    services: ["Đo mắt tự động", "Thử kính chỉnh quang", "Kiểm tra nhược thị"],
    doctors: ["BS. Đặng Thu Diễm", "BS. Lê Văn Luyện"]
  },
  {
    id: "Pediatric",
    name: "Nhãn nhi & Điều trị Lác (Pediatrics)",
    description: "Khám và điều trị chuyên sâu các bệnh lý mắt ở trẻ em, kiểm soát tiến triển cận thị học đường, tập nhược thị và phẫu thuật chỉnh lác.",
    icon: Activity,
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    services: ["Khám mắt trẻ em", "Tập nhược thị chuyên sâu", "Điều trị lác mắt học đường"],
    doctors: ["BS. Đặng Thu Diễm"]
  },
  {
    id: "Surgery",
    name: "Phẫu thuật Khúc xạ (LASIK / SMILE)",
    description: "Ứng dụng các công nghệ laser hiện đại nhất thế giới (ReLex SMILE, Femto-LASIK) giúp xóa cận thị hoàn toàn, an toàn và phục hồi nhanh.",
    icon: Sparkles,
    color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    services: ["Bắn mắt xóa cận ReLex SMILE", "Khám tầm soát giác mạc", "Tư vấn kính áp tròng Ortho-K"],
    doctors: ["BS. Lê Văn Luyện"]
  },
  {
    id: "Glaucoma",
    name: "Điều trị Glaucoma (Cườm Nước)",
    description: "Tầm soát, theo dõi huyết áp mắt (nhãn áp) định kỳ và điều trị laser/phẫu thuật bảo vệ dây thần kinh thị giác cho bệnh nhân tăng nhãn áp.",
    icon: ShieldCheck,
    color: "text-rose-600 bg-rose-50 border-rose-100",
    services: ["Đo nhãn áp không tiếp xúc", "Chụp cắt lớp OCT võng mạc", "Phẫu thuật hạ nhãn áp"],
    doctors: ["BS. Lê Văn Luyện"]
  },
  {
    id: "Cornea",
    name: "Giác mạc & Bệnh bề mặt nhãn cầu",
    description: "Khám điều trị viêm loét giác mạc, khô mắt cấp độ nặng, mộng thịt, mổ đục thủy tinh thể (phaco) thay thế thủy tinh thể nhân tạo.",
    icon: Layers,
    color: "text-amber-600 bg-amber-50 border-amber-100",
    services: ["Điều trị khô mắt bằng IPL", "Mổ đục thủy tinh thể (Phaco)", "Điều trị viêm loét giác mạc"],
    doctors: ["BS. Đặng Thu Diễm"]
  },
  {
    id: "Retina",
    name: "Võng mạc & Dịch kính",
    description: "Tầm soát và điều trị các tổn thương đáy mắt nguy hiểm như bệnh võng mạc tiểu đường, thoái hóa điểm vàng, bong võng mạc ở người cao tuổi.",
    icon: Stethoscope,
    color: "text-teal-600 bg-teal-50 border-teal-100",
    services: ["Soi đáy mắt trực tiếp", "Tiêm nội nhãn dịch kính", "Laser quang đông võng mạc"],
    doctors: ["BS. Lê Văn Luyện"]
  }
];

export default function ChuyenKhoaPage() {
  return (
    <div className="flex flex-col w-full font-sans bg-slate-50 text-slate-800 min-h-screen">
      
      {/* HEADER BANNER */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="max-w-6xl mx-auto relative z-10 space-y-4">
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-blue-100 font-bold hover:text-white uppercase tracking-wider">
             Trang chủ <ChevronRight className="w-3.5 h-3.5" /> Chuyên khoa
          </Link>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">Chuyên Khoa Nhãn Khoa</h1>
          <p className="text-blue-100 text-sm md:text-base max-w-2xl font-medium leading-relaxed">
            Hệ thống các khoa khám điều trị kỹ thuật cao của VisionCare được phân bổ chuyên môn hóa sâu, đáp ứng các tiêu chuẩn khắt khe nhất về y học.
          </p>
        </div>
      </section>

      {/* SPECIALTIES GRID */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {specialties.map((spec) => {
            const IconComponent = spec.icon;
            return (
              <div 
                key={spec.id}
                className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl border ${spec.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{spec.name}</h2>
                  </div>
                  
                  <p className="text-slate-500 text-sm leading-relaxed">{spec.description}</p>
                  
                  {/* Services list */}
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">Dịch vụ thế mạnh</p>
                    <div className="flex flex-wrap gap-2">
                      {spec.services.map((serv, index) => (
                        <span key={index} className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-lg border border-slate-200/50">
                          {serv}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer of card: Doctors & Link */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                    <UserCheck className="w-4 h-4 text-blue-500" />
                    <span>Chuyên gia phụ trách:</span>
                    <span className="text-slate-800">{spec.doctors.join(", ")}</span>
                  </div>
                  <Link href={`/booking?chuyenkhoa=${spec.id}`}>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 font-bold p-0 gap-1 hover:bg-transparent">
                      <span>Đặt ca này</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* QUICK FOOTER CTA */}
      <section className="bg-white border-t border-slate-200/80 py-12 text-center px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <BookOpen className="w-8 h-8 text-blue-600 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">Bạn muốn khám tổng quát toàn bộ chuyên khoa?</h3>
          <p className="text-slate-500 text-sm max-w-lg mx-auto">Chúng tôi đề xuất Gói Khám Mắt Khúc Xạ Tổng Quát để tầm soát toàn bộ các tật khúc xạ và bệnh lý bề mặt mắt.</p>
          <Link href="/booking">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold h-11 px-6 gap-2 shadow-sm">
              <CalendarDays className="w-4 h-4" />
              <span>Đăng Ký Đặt Lịch Hẹn Ngay</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 py-8 text-slate-500 text-xs text-center border-t border-slate-800">
        <p>© 2026 VisionCare Eye Clinic System. Bảo lưu mọi quyền.</p>
      </footer>
    </div>
  );
}
