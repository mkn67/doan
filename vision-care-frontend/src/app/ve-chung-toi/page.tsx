"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  Eye, Stethoscope, Users, BookOpen, 
  Search, Award, CheckCircle2, ArrowRight, 
  Clock, ShieldCheck, HeartPulse
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* 1. HERO SECTION (Tổng quan hệ thống) */}
      <section className="relative bg-slate-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-semibold tracking-wide">
            <Eye className="w-4 h-4" /> Hệ thống Chăm sóc Mắt Toàn diện
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
            VISION <span className="text-blue-400">CARE</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Chúng tôi cam kết mang lại ánh sáng và tầm nhìn hoàn hảo cho bạn bằng công nghệ hiện đại, đội ngũ chuyên gia tận tâm và dịch vụ chuẩn quốc tế.
          </p>
          <div className="pt-4 flex items-center justify-center gap-4">
            <Button onClick={() => router.push('/booking')} className="bg-blue-600 hover:bg-blue-700 h-12 px-8 text-lg font-semibold shadow-lg shadow-blue-900/50">
              Đặt lịch khám ngay
            </Button>
            <Button onClick={() => router.push('/products')} variant="outline" className="h-12 px-8 text-lg font-semibold bg-white/10 text-white border-white/20 hover:bg-white/20">
              Xem kính & Sản phẩm
            </Button>
          </div>
        </div>
      </section>

      {/* 2. CORE VALUES (Giá trị cốt lõi) */}
      <section className="py-16 max-w-7xl mx-auto px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto rotate-3">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Chuẩn Quốc Tế</h3>
              <p className="text-slate-500">Trang thiết bị đo khám khúc xạ và soi đáy mắt hiện đại nhất được nhập khẩu trực tiếp.</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto -rotate-3">
                <HeartPulse className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Tận Tâm & Thấu Hiểu</h3>
              <p className="text-slate-500">Mỗi bệnh nhân là một người thân. Chúng tôi lắng nghe và đưa ra phác đồ điều trị phù hợp nhất.</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto rotate-3">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Minh Bạch Chi Phí</h3>
              <p className="text-slate-500">Mọi chi phí khám chữa bệnh, giá gọng kính, tròng kính đều được niêm yết công khai rõ ràng.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. CHUYÊN KHOA ĐIỀU TRỊ */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Chuyên Khoa Mũi Nhọn</h2>
            <p className="text-slate-500 mt-3">Đa dạng các dịch vụ chăm sóc và điều trị chuyên sâu về mắt cho mọi lứa tuổi.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Khúc xạ & Cận thị", desc: "Đo thị lực, cắt kính cận/viễn/loạn bằng hệ thống máy tự động chính xác cao.", icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
              { title: "Nhãn khoa Nhi", desc: "Kiểm soát cận thị tiến triển, nhược thị và lác (lé) ở trẻ em.", icon: Users, color: "text-rose-600", bg: "bg-rose-50" },
              { title: "Bệnh lý Đáy mắt", desc: "Tầm soát và điều trị các bệnh võng mạc tiểu đường, thoái hóa điểm vàng.", icon: Stethoscope, color: "text-emerald-600", bg: "bg-emerald-50" },
              { title: "Mài lắp kính Kỹ thuật cao", desc: "Xưởng chế tác kính ngay tại phòng khám, lấy ngay trong 30 phút.", icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
            ].map((khoa, idx) => (
              <div key={idx} className="group p-6 rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-lg transition-all bg-slate-50/50 hover:bg-white cursor-pointer">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${khoa.bg} ${khoa.color}`}>
                  <khoa.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{khoa.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{khoa.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TÌM BÁC SĨ & ĐỘI NGŨ */}
      <section className="py-20 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Đội ngũ Y Bác sĩ Chuyên gia</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Tại Vision Care, bạn sẽ được thăm khám trực tiếp bởi các bác sĩ Chuyên khoa Mắt giàu kinh nghiệm, cùng đội ngũ Kỹ thuật viên Khúc xạ được đào tạo bài bản, cấp chứng chỉ hành nghề chính quy.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Bác sĩ chuyên khoa I & II Nhãn khoa.
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Kỹ thuật viên khúc xạ kinh nghiệm {">"} 5 năm.
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Tư vấn viên am hiểu sâu về các loại tròng/gọng kính.
              </li>
            </ul>
            <Button className="bg-slate-900 hover:bg-slate-800 h-11 px-6 mt-4 gap-2">
              <Search className="w-4 h-4" /> Tra cứu Bác sĩ & Đặt lịch
            </Button>
          </div>
          <div className="lg:w-1/2 grid grid-cols-2 gap-4">
             {/* Giả lập hình ảnh bác sĩ */}
             <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop" alt="Doctor 1" className="rounded-2xl object-cover h-64 w-full shadow-md" />
             <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2000&auto=format&fit=crop" alt="Doctor 2" className="rounded-2xl object-cover h-64 w-full shadow-md mt-8" />
          </div>
        </div>
      </section>

      {/* 5. HƯỚNG DẪN ĐI KHÁM */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold">Hướng Dẫn Khám Bệnh Nhanh Chóng</h2>
            <p className="text-blue-100 mt-3 text-lg">Quy trình 4 bước đơn giản, không phải chờ đợi lâu.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Đường gạch ngang kết nối các bước (Chỉ hiện trên desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-blue-400/30 -translate-y-1/2 z-0" />
            
            {[
              { step: "1", title: "Đặt lịch Online", desc: "Chọn ngày giờ và bác sĩ mong muốn qua website." },
              { step: "2", title: "Lễ tân tiếp đón", desc: "Đọc số điện thoại để xác nhận tại quầy Lễ tân." },
              { step: "3", title: "Thăm khám", desc: "Đo khúc xạ, soi đáy mắt và nhận tư vấn từ bác sĩ." },
              { step: "4", title: "Nhận kết quả", desc: "Mua kính/thuốc, thanh toán và nhận kính tại Xưởng." },
            ].map((item, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-blue-800 border-4 border-blue-500 flex items-center justify-center text-2xl font-black mb-6 group-hover:scale-110 transition-transform shadow-xl">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed max-w-[200px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <section className="py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Bạn cần hỗ trợ trực tiếp?</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button className="bg-slate-900 hover:bg-slate-800 h-12 px-8 text-base">
            <BookOpen className="w-5 h-5 mr-2" /> Xem cẩm nang Nhãn khoa
          </Button>
          <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 h-12 px-8 text-base">
            <Clock className="w-5 h-5 mr-2" /> Giờ làm việc: 8:00 - 20:00
          </Button>
        </div>
      </section>

    </div>
  );
}