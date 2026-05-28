"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Clock, 
  PlayCircle, 
  UserCheck, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  UserMinus,
  Calendar,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Printer
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { QRCodeSVG } from "qrcode.react";

import { useHangChoHomNay, useGoiVaoKham, useKetThucKham } from "@/hooks/useClinic"; 
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { HangChoHomNayDTO } from "@/types/staff";

export default function QueuePage() {
  const router = useRouter();
  
  // Printing Ticket STT State & Ref
  const [ticketToPrint, setTicketToPrint] = useState<HangChoHomNayDTO | null>(null);
  const ticketPrintRef = React.useRef<HTMLDivElement>(null);

  const handlePrintTicket = useReactToPrint({
    contentRef: ticketPrintRef,
    documentTitle: `PhieuSTT_VisionCare_${ticketToPrint?.maHc || "New"}`,
    onAfterPrint: () => setTicketToPrint(null),
  });

  const triggerPrintTicket = (item: HangChoHomNayDTO) => {
    setTicketToPrint(item);
    setTimeout(() => {
      handlePrintTicket();
    }, 100);
  };
  
  // Fetch patient queue data
  const { data, isLoading, refetch, isRefetching } = useHangChoHomNay();
  
  // Mutation hooks
  const goiKhamMutation = useGoiVaoKham();
  const ketThucMutation = useKetThucKham();

  // State to track current dragging item and hovered column target
  const [draggingItem, setDraggingItem] = useState<HangChoHomNayDTO | null>(null);
  const [activeOverColumn, setActiveOverColumn] = useState<string | null>(null); // "waiting" | "examining" | "completed" | "skipped"

  // Handle API wrappers/pagination variations
  const queueList: HangChoHomNayDTO[] = data?.content || data || [];

  // Categorize patients based on backend statuses
  const waitingList = queueList.filter(
    (item) => item.trangThai === "DANG_CHO" || item.trangThai === "Đang chờ"
  );
  const examiningList = queueList.filter(
    (item) => item.trangThai === "DANG_KHAM" || item.trangThai === "Đang khám"
  );

  // Call actions
  const handleGoiKham = (maKh: string, maHc: string) => {
    const promise = new Promise((resolve, reject) => {
      goiKhamMutation.mutate(maHc, {
        onSuccess: () => {
          resolve("Gọi khám thành công!");
          router.push(`/staff/clinic/examinations?makh=${maKh}&mahc=${maHc}`);
        },
        onError: (err: any) => {
          reject(err?.response?.data?.message || "Không thể gọi khám.");
        }
      });
    });

    toast.promise(promise, {
      loading: "Đang gọi khám & chuyển hướng...",
      success: (data: any) => `${data}`,
      error: (err) => `Lỗi: ${err}`
    });
  };

  const handleKetThucKham = (maHc: string, trangThai: "Hoàn thành" | "Bỏ về") => {
    const actionName = trangThai === "Hoàn thành" ? "Hoàn thành khám" : "Cho bỏ về / Hủy";
    const promise = new Promise((resolve, reject) => {
      ketThucMutation.mutate({ maHc, trangThai }, {
        onSuccess: () => {
          resolve(`${actionName} thành công!`);
        },
        onError: (err: any) => {
          reject(err?.response?.data?.message || "Thao tác thất bại.");
        }
      });
    });

    toast.promise(promise, {
      loading: `Đang cập nhật trạng thái...`,
      success: (data: any) => `${data}`,
      error: (err) => `Lỗi: ${err}`
    });
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, item: HangChoHomNayDTO) => {
    setDraggingItem(item);
    e.dataTransfer.setData("maHc", item.maHc);
    // Optional glow effect / styling during drag
    e.currentTarget.classList.add("opacity-50");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggingItem(null);
    setActiveOverColumn(null);
    e.currentTarget.classList.remove("opacity-50");
  };

  const handleDragOver = (e: React.DragEvent, column: string) => {
    e.preventDefault();
    if (activeOverColumn !== column) {
      setActiveOverColumn(column);
    }
  };

  const handleDragLeave = () => {
    setActiveOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault();
    setActiveOverColumn(null);
    if (!draggingItem) return;

    const sourceStatus = draggingItem.trangThai;
    const isSourceWaiting = sourceStatus === "DANG_CHO" || sourceStatus === "Đang chờ";
    const isSourceExamining = sourceStatus === "DANG_KHAM" || sourceStatus === "Đang khám";

    if (targetColumn === "examining" && isSourceWaiting) {
      handleGoiKham(draggingItem.maKh, draggingItem.maHc);
    } else if (targetColumn === "completed" && isSourceExamining) {
      handleKetThucKham(draggingItem.maHc, "Hoàn thành");
    } else if (targetColumn === "skipped" && (isSourceExamining || isSourceWaiting)) {
      handleKetThucKham(draggingItem.maHc, "Bỏ về");
    } else {
      toast.warning("Quy trình chuyển đổi không hợp lệ! Hãy kéo đúng luồng quy trình.");
    }
  };

  const isMutating = goiKhamMutation.isPending || ketThucMutation.isPending;

  return (
    <div className="p-6 md:p-8 space-y-6 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 min-h-[calc(100vh-4rem)] text-white relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/50 pb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight">
              Bảng Điều Phối Hàng Chờ
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Bác sĩ kéo thả bệnh nhân giữa các phân vùng để thực hiện khám mắt và hoàn tất quy trình.
            </p>
          </div>
        </div>

        {/* STATS & ACTIONS */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/60 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/60 text-xs">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Tổng cộng: <strong className="text-blue-400 font-bold">{queueList.length}</strong> ca hôm nay</span>
          </div>

          <Button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            variant="outline"
            className="bg-slate-800/50 hover:bg-slate-700/50 text-white border-slate-700/80 hover:border-slate-600/80 h-10 px-4 rounded-xl flex items-center gap-2 transition-all duration-300"
          >
            <RefreshCw className={`w-4 h-4 ${(isLoading || isRefetching) ? "animate-spin text-blue-400" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* KANBAN BOARD CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* COLUMN 1: WAITING LIST */}
        <div 
          className={`flex flex-col min-h-[550px] bg-slate-900/40 backdrop-blur-xl rounded-2xl border transition-all duration-300 ${
            activeOverColumn === "waiting" 
              ? "border-amber-500/60 bg-slate-800/30 shadow-lg shadow-amber-500/5" 
              : "border-slate-800/80"
          }`}
          onDragOver={(e) => handleDragOver(e, "waiting")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, "waiting")}
        >
          <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-950/20 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50 animate-pulse"></span>
              <h2 className="font-semibold text-slate-200">Đang Chờ Khám</h2>
            </div>
            <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold rounded-full">
              {waitingList.length}
            </span>
          </div>

          <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-800">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
                <span className="text-sm">Đang tải hàng chờ...</span>
              </div>
            ) : waitingList.length > 0 ? (
              waitingList.map((item) => (
                <div
                  key={item.maHc}
                  draggable={!isMutating}
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  className="group bg-slate-950/40 hover:bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all duration-300 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md relative overflow-hidden"
                >
                  {/* Decorative indicator */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                  
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-500">STT #{item.soThuTu}</span>
                      <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors text-base mt-0.5">
                        {item.tenKhach}
                      </h3>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                      item.loaiKhach === "ONLINE" || item.loaiKhach === "Hen truoc"
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    }`}>
                      {item.loaiKhach || "WALK-IN"}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                    {item.sdt && <p>SĐT: <span className="text-slate-300 font-medium">{item.sdt}</span></p>}
                    {item.tenBacSi && <p>BS phân công: <span className="text-slate-300 font-medium">{item.tenBacSi}</span></p>}
                    {item.goiKham && <p>Gói khám: <span className="text-blue-400 font-medium">{item.goiKham}</span></p>}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-amber-500/80" />
                      <span>Chờ {item.phutCho || 0} phút</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => triggerPrintTicket(item)}
                        className="h-7 w-7 rounded-lg border-slate-700 hover:bg-slate-800 hover:text-white text-slate-400"
                        title="In phiếu STT"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        onClick={() => handleGoiKham(item.maKh, item.maHc)}
                        disabled={isMutating}
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] h-7 px-3 rounded-lg flex items-center gap-1 shadow-sm transition-all"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Gọi Khám</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-600 border border-dashed border-slate-800/80 rounded-xl">
                <UserCheck className="w-10 h-10 text-slate-700 mb-2" />
                <p className="text-xs font-semibold text-slate-500">Không có ai trong hàng chờ</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: EXAMINING LIST */}
        <div 
          className={`flex flex-col min-h-[550px] bg-slate-900/40 backdrop-blur-xl rounded-2xl border transition-all duration-300 ${
            activeOverColumn === "examining" 
              ? "border-blue-500/60 bg-slate-800/30 shadow-lg shadow-blue-500/5" 
              : "border-slate-800/80"
          }`}
          onDragOver={(e) => handleDragOver(e, "examining")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, "examining")}
        >
          <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-950/20 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 animate-pulse"></span>
              <h2 className="font-semibold text-slate-200">Đang Khám</h2>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold rounded-full">
              {examiningList.length}
            </span>
          </div>

          <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-800">
            {examiningList.length > 0 ? (
              examiningList.map((item) => (
                <div
                  key={item.maHc}
                  draggable={!isMutating}
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  className="group bg-slate-950/40 hover:bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all duration-300 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md relative overflow-hidden"
                >
                  {/* Decorative indicator */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                  
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-500">STT #{item.soThuTu}</span>
                      <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors text-base mt-0.5">
                        {item.tenKhach}
                      </h3>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border bg-blue-500/10 text-blue-400 border-blue-500/20`}>
                      ĐANG KHÁM
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                    {item.sdt && <p>SĐT: <span className="text-slate-300 font-medium">{item.sdt}</span></p>}
                    {item.tenBacSi && <p>BS đảm nhận: <span className="text-slate-300 font-medium">{item.tenBacSi}</span></p>}
                    {item.goiKham && <p>Gói khám: <span className="text-blue-400 font-medium">{item.goiKham}</span></p>}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-blue-500/80" />
                      <span>Bắt đầu từ: {item.gioDangKy ? new Date(item.gioDangKy).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : "---"}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => triggerPrintTicket(item)}
                        className="h-7 w-7 rounded-lg border-slate-700 hover:bg-slate-800 hover:text-white text-slate-400"
                        title="In phiếu STT"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        onClick={() => handleKetThucKham(item.maHc, "Hoàn thành")}
                        disabled={isMutating}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] h-7 px-2 rounded-lg flex items-center gap-0.5 shadow-sm transition-all"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Xong</span>
                      </Button>
                      <Button
                        onClick={() => handleKetThucKham(item.maHc, "Bỏ về")}
                        disabled={isMutating}
                        variant="destructive"
                        size="sm"
                        className="font-semibold text-[10px] h-7 px-2 rounded-lg flex items-center gap-0.5 shadow-sm transition-all"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Hủy</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-600 border border-dashed border-slate-800/80 rounded-xl">
                <HelpCircle className="w-10 h-10 text-slate-700 mb-2" />
                <p className="text-xs font-semibold text-slate-500">Không có bệnh nhân đang khám</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-[200px] text-center">Kéo bệnh nhân từ cột Đang chờ sang để bắt đầu khám</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: TERMINAL DROP ZONE */}
        <div className="flex flex-col min-h-[550px] bg-slate-900/20 backdrop-blur-xl rounded-2xl border border-slate-800/60 p-4 space-y-6">
          <div className="border-b border-slate-800/80 pb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-500" />
              <span>Phân Khu Hoàn Tất Ca Khám</span>
            </h2>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {/* SUB-ZONE 1: COMPLETE PATIENT */}
            <div
              className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all duration-300 ${
                activeOverColumn === "completed"
                  ? "border-emerald-500 bg-emerald-500/5 text-emerald-400 scale-[1.02]"
                  : "border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400"
              }`}
              onDragOver={(e) => handleDragOver(e, "completed")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "completed")}
            >
              <CheckCircle className={`w-12 h-12 mb-3 transition-transform ${activeOverColumn === "completed" ? "scale-110 text-emerald-400 animate-bounce" : "text-slate-600"}`} />
              <h3 className="font-bold text-sm text-slate-300">HOÀN THÀNH KHÁM</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                Kéo thả bệnh nhân từ cột <b>Đang Khám</b> vào đây để hoàn tất kiểm tra thị lực.
              </p>
            </div>

            {/* SUB-ZONE 2: SKIP/CANCEL PATIENT */}
            <div
              className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all duration-300 ${
                activeOverColumn === "skipped"
                  ? "border-rose-500 bg-rose-500/5 text-rose-400 scale-[1.02]"
                  : "border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400"
              }`}
              onDragOver={(e) => handleDragOver(e, "skipped")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "skipped")}
            >
              <UserMinus className={`w-12 h-12 mb-3 transition-transform ${activeOverColumn === "skipped" ? "scale-110 text-rose-400 animate-pulse" : "text-slate-600"}`} />
              <h3 className="font-bold text-sm text-slate-300">BỎ KHÁM / HỦY CA</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                Kéo thả bệnh nhân từ cột bất kỳ vào đây để hủy lượt hoặc báo cáo bỏ về.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Ticket Container for Printing */}
      <div className="hidden">
        <div ref={ticketPrintRef} className="p-8 w-[80mm] text-black font-mono text-center flex flex-col items-center justify-center bg-white">
          <h2 className="text-xl font-bold tracking-wider">VISION CARE</h2>
          <p className="text-[10px] mt-0.5">He thong cham soc mat toan dien</p>
          <p className="text-[10px]">DC: 123 Ton Duc Thang, Q.1, TP.HCM</p>
          <div className="border-b border-dashed border-black w-full my-3" />
          
          <h1 className="text-3xl font-extrabold my-2">SO THU TU: {ticketToPrint?.soThuTu}</h1>
          <p className="text-sm font-semibold">Ma hang cho: {ticketToPrint?.maHc}</p>
          
          <div className="border-b border-dashed border-black w-full my-3" />
          
          <div className="text-left w-full text-xs space-y-1">
            <p><strong>Khach hang:</strong> {ticketToPrint?.tenKhach}</p>
            {ticketToPrint?.sdt && <p><strong>SDT:</strong> {ticketToPrint?.sdt}</p>}
            {ticketToPrint?.tenBacSi && <p><strong>Bac si:</strong> {ticketToPrint?.tenBacSi}</p>}
            {ticketToPrint?.goiKham && <p><strong>Goi kham:</strong> {ticketToPrint?.goiKham}</p>}
            <p><strong>Ngay gio:</strong> {new Date().toLocaleString("vi-VN")}</p>
          </div>
          
          <div className="border-b border-dashed border-black w-full my-3" />
          
          {ticketToPrint && (
            <div className="p-2 border border-black rounded-lg bg-white inline-block">
              <QRCodeSVG
                value={`http://localhost:3000/staff/clinic/examinations?makh=${ticketToPrint.maKh}&mahc=${ticketToPrint.maHc}`}
                size={120}
                level={"H"}
              />
            </div>
          )}
          <p className="text-[9px] mt-2 text-slate-500 font-sans">
            Quet ma QR de mo ho so nhanh tai phong kham
          </p>
          
          <p className="text-[11px] mt-4 font-bold uppercase tracking-wider">Vui long doi goi so!</p>
        </div>
      </div>
    </div>
  );
}