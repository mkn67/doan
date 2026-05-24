"use client";

import React from "react";
import Link from "next/link";
import { 
  BookOpen, 
  CalendarDays, 
  Eye, 
  Wallet, 
  HelpCircle, 
  ChevronRight,
  ArrowRight,
  ClipboardCheck,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    step: "01",
    title: "Đặt lịch hẹn trực tuyến",
    description: "Khách hàng truy cập trang đặt lịch hẹn, chọn Gói dịch vụ khám, Bác sĩ nhãn khoa và khung giờ trống mong muốn. Hoàn tất thông tin cá nhân để nhận mã đặt lịch.",
    icon: CalendarDays,
    color: "from-blue-500 to-indigo-500"
  },
  {
    step: "02",
    title: "Tiếp đón và đo khúc xạ",
    description: "Đến phòng khám đúng hẹn. Lễ tân check-in hàng chờ và điều phối vào phòng đo mắt tự động. Bác sĩ thực hiện đo thị lực chủ quan, soi đáy mắt và ra kết luận kết quả khám.",
    icon: Eye,
    color: "from-indigo-500 to-purple-500"
  },
  {
    step: "03",
    title: "Kê đơn kính & Gia công mài lắp",
    description: "Nếu có tật khúc xạ, bác sĩ kê đơn tròng kính. Yêu cầu chuyển xuống xưởng mài để kỹ thuật viên mài lắp tròng kính vào gọng kính vật lý của bạn trong vòng 15-30 phút.",
    icon: ClipboardCheck,
    color: "from-purple-500 to-pink-500"
  },
  {
    step: "04",
    title: "Thanh toán và nhận kính",
    description: "Thu ngân đối chiếu hóa đơn tổng hợp (Khám + Thuốc + Kính). Hỗ trợ thanh toán nhanh bằng tiền mặt hoặc quét VietQR động. Nhận kính kèm tài liệu bảo hành.",
    icon: Wallet,
    color: "from-pink-500 to-rose-500"
  }
];

const faqs = [
  {
    q: "Tôi cần chuẩn bị giấy tờ gì khi đến khám?",
    a: "Bạn chỉ cần mang theo Căn cước công dân (CCCD), Thẻ bảo hiểm y tế (BHYT) nếu có và tin nhắn/email chứa Mã Lịch Hẹn để lễ tân làm thủ tục check-in nhanh."
  },
  {
    q: "Thời gian làm việc của phòng khám như thế nào?",
    a: "Phòng khám làm việc từ 7:30 đến 17:30 tất cả các ngày trong tuần (từ Thứ Hai đến Chủ Nhật). Các ca đặt lịch hẹn online được ưu tiên tiếp đón trước."
  },
  {
    q: "Sau khi cắt kính tôi có được bảo hành không?",
    a: "VisionCare hỗ trợ bảo hành kỹ thuật 6 tháng đối với gọng kính (lỏng ốc, rơi đệm mũi) và tròng kính (lỗi lớp phủ váng, trầy xước từ nhà sản xuất) tính từ ngày nhận kính."
  },
  {
    q: "Hóa đơn thanh toán gồm những khoản chi phí nào?",
    a: "Hóa đơn được tổng hợp tự động từ phần mềm bao gồm: Tiền gói dịch vụ khám ban đầu, Tiền thuốc kê đơn của bác sĩ, và Tiền gọng/tròng kính gia công (nếu khách hàng có cắt kính)."
  }
];

export default function HuongDanPage() {
  return (
    <div className="flex flex-col w-full font-sans bg-slate-50 text-slate-800 min-h-screen">
      
      {/* HEADER BANNER */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="max-w-6xl mx-auto relative z-10 space-y-4">
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-blue-100 font-bold hover:text-white uppercase tracking-wider">
             Trang chủ <ChevronRight className="w-3.5 h-3.5" /> Hướng dẫn
          </Link>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">Hướng Dẫn Khách Hàng</h1>
          <p className="text-blue-100 text-sm md:text-base max-w-2xl font-medium leading-relaxed">
            Mọi quy trình khám chữa bệnh tại VisionCare đều được chuẩn hóa rõ ràng giúp bạn tiết kiệm tối đa thời gian chờ đợi.
          </p>
        </div>
      </section>

      {/* STEPS LIST */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full relative z-10 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">Quy Trình Khám Khép Kín</h2>
          <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto">Trải nghiệm dịch vụ 4 bước nhanh gọn và minh bạch tuyệt đối.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => {
            const IconComp = item.icon;
            return (
              <div 
                key={item.step}
                className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-sm`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-black text-slate-100 font-mono tracking-widest">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{item.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 bg-white border-y border-slate-200/80 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center justify-center gap-2">
              <HelpCircle className="w-7 h-7 text-blue-600 animate-bounce" /> Câu Hỏi Thường Gặp
            </h2>
            <p className="text-slate-500 text-sm">Giải đáp nhanh các thắc mắc phổ biến của bệnh nhân khi tới phòng khám.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="p-6 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-2 hover:border-slate-350 transition-colors"
              >
                <h3 className="font-bold text-slate-800 text-base flex items-start gap-2">
                  <span className="text-blue-600 font-extrabold font-mono">Q:</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA REGISTER */}
      <section className="py-16 text-center px-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100/80 p-8 rounded-3xl space-y-4">
          <Clock className="w-8 h-8 text-indigo-600 mx-auto" />
          <h3 className="text-xl font-bold text-indigo-950">Tiết kiệm thời gian xếp hàng chờ đợi</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">Đặt hẹn trực tuyến trước giúp bạn được check-in ưu tiên tại quầy lễ tân nhãn khoa của chúng tôi.</p>
          <Link href="/booking">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold h-11 px-6 gap-2 shadow-md shadow-indigo-200">
              <span>Đăng Ký Đặt Lịch Hẹn Ngay</span>
              <ArrowRight className="w-4 h-4" />
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
