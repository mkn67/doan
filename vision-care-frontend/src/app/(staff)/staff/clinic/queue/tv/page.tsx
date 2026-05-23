"use client";

import React, { useState, useEffect } from "react";
import { 
  Tv, 
  Clock, 
  Activity, 
  Users, 
  Volume2, 
  Bell, 
  VolumeX,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useHangChoHomNay } from "@/hooks/useClinic";
import { HangChoHomNayDTO } from "@/types/staff";

export default function TVQueuePage() {
  const { data, refetch, isLoading } = useHangChoHomNay();
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [prevExaminingIds, setPrevExaminingIds] = useState<string[]>([]);

  // Parse queue list
  const queueList: HangChoHomNayDTO[] = data?.content || data || [];

  // Categorize patients
  const waitingList = queueList.filter(
    (item) => item.trangThai === "DANG_CHO" || item.trangThai === "Đang chờ"
  );
  const examiningList = queueList.filter(
    (item) => item.trangThai === "DANG_KHAM" || item.trangThai === "Đang khám"
  );

  // Poll server every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Digital Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Text-to-speech audio alert when a new patient enters the exam room
  useEffect(() => {
    if (examiningList.length > 0) {
      const currentIds = examiningList.map(item => item.maHc);
      const newlyAdded = examiningList.filter(item => !prevExaminingIds.includes(item.maHc));

      if (newlyAdded.length > 0 && !isMuted) {
        const patient = newlyAdded[0];
        const text = `Xin mời bệnh nhân số ${patient.soThuTu}, ${patient.tenKhach}, vào phòng khám của bác sĩ ${patient.tenBacSi || "nhãn khoa"}`;
        
        // Web Speech API
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel(); // Cancel any ongoing speech
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "vi-VN";
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      }
      setPrevExaminingIds(currentIds);
    }
  }, [examiningList, prevExaminingIds, isMuted]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white font-sans overflow-hidden flex flex-col p-6 z-[9999]">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* TV TOP HEADER */}
      <div className="flex items-center justify-between border-b-2 border-slate-800/80 pb-4 mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <Tv className="w-8 h-8 animate-pulse text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-wider bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent uppercase flex items-center gap-2">
              VISION CARE <Sparkles className="w-5 h-5 text-blue-400" />
            </h1>
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Màn hình điều hướng hàng chờ phòng khám</p>
          </div>
        </div>

        {/* Audio control & Time */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className={`p-3 rounded-xl border transition-all flex items-center gap-2 ${
              isMuted 
                ? "bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800/60" 
                : "bg-emerald-500/20 border-emerald-500 text-emerald-400 hover:bg-emerald-500/30"
            }`}
            title={isMuted ? "Bật âm thanh gọi loa" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-bounce" />}
            <span className="text-xs font-bold uppercase">{isMuted ? "Loa Tắt" : "Loa Gọi Bật"}</span>
          </button>
          
          <div className="text-right border-l-2 border-slate-800 pl-6 space-y-1">
            <div className="text-3xl font-black font-mono text-emerald-400 tracking-wider bg-slate-900/50 px-3 py-1 rounded-xl border border-slate-800/60">{time}</div>
            <div className="text-xs font-bold text-slate-400 uppercase">{date}</div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 relative z-10">
        
        {/* LEFT COLUMN: NOW SERVING (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col min-h-0">
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border-2 border-emerald-500/30 rounded-3xl p-5 mb-4 shadow-xl">
            <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-widest flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Đang gọi khám / Now Serving
            </h2>
            <p className="text-xs text-emerald-500/80 font-bold uppercase mt-1">Xin vui lòng di chuyển vào phòng khám tương ứng</p>
          </div>

          <div className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 overflow-y-auto space-y-6 shadow-2xl">
            {examiningList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-4">
                <Activity className="w-16 h-16 text-slate-700 animate-pulse" />
                <div>
                  <p className="text-xl font-bold">Chưa có bệnh nhân nào khám</p>
                  <p className="text-sm mt-1">Hệ thống đang sẵn sàng tiếp nhận lượt khám mới.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {examiningList.map((item, idx) => (
                  <div 
                    key={item.maHc} 
                    className={`p-6 rounded-2xl border flex items-center justify-between shadow-lg transition-all transform hover:scale-[1.01] ${
                      idx === 0 
                        ? "bg-gradient-to-r from-emerald-950/40 to-slate-900/60 border-emerald-500/40 shadow-emerald-950/20" 
                        : "bg-slate-900/60 border-slate-800"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="bg-emerald-500 text-slate-950 font-black text-lg px-3 py-1 rounded-lg">STT {item.soThuTu}</span>
                        <span className="text-sm text-slate-400 font-bold tracking-widest">{item.maKh}</span>
                      </div>
                      <h3 className="text-3xl font-black text-white tracking-wide uppercase">{item.tenKhach}</h3>
                      <p className="text-sm font-semibold text-slate-400">Gói: <span className="text-slate-200">{item.goiKham || "Khám khúc xạ"}</span></p>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-xs font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-full border border-emerald-500/30">Phòng Khám Mắt</span>
                      <p className="text-2xl font-black text-emerald-400 mt-2">Bác sĩ: {item.tenBacSi || "Chuyên khoa"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: WAITING QUEUE (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col min-h-0">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-5 mb-4 flex items-center justify-between shadow-xl">
            <h2 className="text-2xl font-black text-blue-400 uppercase tracking-widest flex items-center gap-3">
              <Users className="w-7 h-7 text-blue-400" />
              Danh sách chờ khám / Waiting List
            </h2>
            <div className="bg-blue-900/30 border border-blue-500/30 text-blue-400 font-black px-4 py-1.5 rounded-2xl text-sm">
              Đang Chờ: {waitingList.length} BN
            </div>
          </div>

          <div className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 overflow-y-auto shadow-2xl">
            {waitingList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-4">
                <Users className="w-16 h-16 text-slate-700" />
                <div>
                  <p className="text-xl font-bold">Danh sách chờ trống</p>
                  <p className="text-sm mt-1">Lễ tân chưa phân luồng bệnh nhân nào vào hàng chờ hôm nay.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {waitingList.map((item) => (
                  <div 
                    key={item.maHc} 
                    className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-4 hover:border-slate-700 transition-colors shadow"
                  >
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-2xl w-14 h-14 rounded-xl flex items-center justify-center shadow-md">
                      {item.soThuTu}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-200 truncate uppercase">{item.tenKhach}</h3>
                      <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                        <span>{item.maKh}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-slate-400">{item.tenBacSi || "Bác sĩ nhãn khoa"}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* FOOTER TICKER */}
      <div className="mt-6 border-t border-slate-800/80 pt-4 bg-slate-950/80 rounded-2xl px-6 py-3 border border-slate-850 relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-xs tracking-wider min-w-[120px]">
          <Bell className="w-4 h-4 animate-bounce" /> Thông báo:
        </div>
        <div className="flex-1 overflow-hidden relative">
          {/* Scrolling Marquee */}
          <div className="whitespace-nowrap text-sm font-semibold text-slate-300 animate-[marquee_25s_linear_infinite]">
            ⚠️ Quý khách vui lòng chuẩn bị sẵn thẻ BHYT, CCCD hoặc lịch hẹn trực tuyến khi tới số thứ tự. Trẻ em dưới 6 tuổi được ưu tiên gọi khám trước. Chúc quý khách một ngày tốt lành!
          </div>
        </div>
      </div>

      {/* Inline styles for custom animations */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
