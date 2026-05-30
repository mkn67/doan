"use client";

import "@/app/globals.css";
import * as React from "react";
import { Suspense, useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams, useRouter } from "next/navigation"; 
import { useReactToPrint } from "react-to-print";

import { useAuth } from "@/hooks/useAuth";
import { useCreateHoSoKham, useHangChoHomNay, useLichSuKham } from "@/hooks/useClinic"; 
import { useKhachHang } from "@/hooks/useCustomer";
import { useDanhSachSanPham } from "@/hooks/useInventory";
import { clinicApi } from "@/lib/api/clinic.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RecordDiffDialog from "@/components/clinic/RecordDiffDialog";
import { PrintA4Record } from "@/components/clinic/PrintA4Record";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { HoSoKhamRequest, HoSoKhamResponse, ChiTietThiLuc } from "@/types/clinic";
import { KhachHangResponseDTO } from "@/types/customer";
import { SanPhamResponse } from "@/types/inventory";
import { HangChoHomNayDTO } from "@/types/staff";

// FIX: Đổi tên History thành HistoryIcon để né bẫy trùng tên đối tượng global window của trình duyệt
import { 
  Activity, 
  Eye, 
  ArrowRight, 
  Loader2, 
  Upload, 
  Sparkles, 
  History as HistoryIcon,
  Printer,
  Trash2,
  Plus,
  Stethoscope,
  ShieldAlert
} from "lucide-react";

const examSchema = z.object({
  maKh: z.string().min(1, "Vui lòng nhập mã khách hàng"),
  maNs: z.string().min(1, "Vui lòng nhập mã bác sĩ"),
  matTraiSph: z.any(),
  matTraiCyl: z.any().optional(),
  matTraiAx: z.any().optional().refine(val => {
    if (val === undefined || val === "" || val === null) return true;
    const num = Number(val);
    return !isNaN(num) && num >= 0 && num <= 180;
  }, "Trục Axis OS phải từ 0° đến 180°"),
  matPhaiSph: z.any(),
  matPhaiCyl: z.any().optional(),
  matPhaiAx: z.any().optional().refine(val => {
    if (val === undefined || val === "" || val === null) return true;
    const num = Number(val);
    return !isNaN(num) && num >= 0 && num <= 180;
  }, "Trục Axis OD phải từ 0° đến 180°"),
  pd: z.any().refine(val => {
    const num = Number(val);
    return !isNaN(num) && num > 0;
  }, "PD phải lớn hơn 0"),
  ketluan: z.string().min(1, "Vui lòng điền kết luận của bác sĩ"),
  maHoSo: z.string().optional(),
  donKinh: z.string().optional(),
  danhSachKinh: z.array(
    z.object({
      maSp: z.string().min(1, "Vui lòng chọn sản phẩm"),
      soLuong: z.number({ message: "Phải là số" }).min(1, "Số lượng phải >= 1"),
    })
  ).optional(),
  danhSachThuoc: z.array(
    z.object({
      maSp: z.string().min(1, "Vui lòng chọn sản phẩm"),
      soLuong: z.number({ message: "Phải là số" }).min(1, "Số lượng phải >= 1"),
    })
  ).optional(),
});

type ExamFormValues = z.infer<typeof examSchema>;

// =========================================================
// CUSTOMER DETAILS CARD COMPONENT
// =========================================================
function CustomerDetailsCard({ customer, isLoading }: { customer?: KhachHangResponseDTO | null; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-sm overflow-hidden animate-pulse bg-white">
        <CardContent className="p-5 space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded w-full" />
            <div className="h-3 bg-slate-200 rounded w-5/6" />
            <div className="h-3 bg-slate-200 rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!customer) {
    return (
      <Card className="border-slate-200 shadow-sm border-dashed p-6 text-center text-slate-400 bg-white/50">
        <p className="text-xs">Chưa chọn bệnh nhân hoặc không có thông tin cá nhân hiển thị.</p>
      </Card>
    );
  }

  const age = customer.ngaySinh
    ? new Date().getFullYear() - new Date(customer.ngaySinh).getFullYear()
    : "N/A";

  return (
    <Card className="border-slate-200 shadow-md overflow-hidden bg-white/80 backdrop-blur-md">
      <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-b pb-3.5">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base font-bold text-slate-800">{customer.hoTen}</CardTitle>
            <CardDescription className="text-xs font-mono text-slate-500 mt-1">Mã KH: {customer.maKh}</CardDescription>
          </div>
          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-full">
            {customer.gioiTinh || "Chưa rõ GD"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
        <div className="space-y-0.5">
          <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Số điện thoại</span>
          <span className="text-slate-800 font-bold">{customer.sdt}</span>
        </div>
        <div className="space-y-0.5">
          <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Tuổi (Ngày sinh)</span>
          <span className="text-slate-800 font-bold">
            {age} tuổi {customer.ngaySinh ? `(${new Date(customer.ngaySinh).toLocaleDateString("vi-VN")})` : ""}
          </span>
        </div>
        <div className="space-y-0.5">
          <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Số CCCD</span>
          <span className="text-slate-800 font-semibold">{customer.cccd || "Chưa khai báo"}</span>
        </div>
        <div className="col-span-2 space-y-0.5 border-t pt-2.5">
          <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Địa chỉ</span>
          <span className="text-slate-800 font-medium">{customer.diaChi || "Chưa nhập địa chỉ"}</span>
        </div>
        {customer.ghiChu && (
          <div className="col-span-2 space-y-1 bg-amber-50/80 p-2.5 rounded-xl border border-amber-100/50 text-amber-900 text-xs">
            <span className="font-bold block text-[10px] uppercase tracking-wider">Ghi chú từ lễ tân</span>
            <span>{customer.ghiChu}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =========================================================
// SVG EYE MAP COMPONENT
// =========================================================
function EyeRefractionMap({
  osSph,
  osCyl,
  osAx,
  odSph,
  odCyl,
  odAx,
  pd,
}: {
  osSph: number;
  osCyl: number;
  osAx: number;
  odSph: number;
  odCyl: number;
  odAx: number;
  pd: number;
}) {
  const getEyeGradient = (val: number) => {
    if (val === 0) return { from: "#ffffff", to: "#f1f5f9" }; 
    if (val < 0) {
      const abs = Math.abs(val);
      if (abs <= 3) {
        return { from: "#93c5fd", to: "#3b82f6" }; 
      } else if (abs <= 6) {
        return { from: "#3b82f6", to: "#1d4ed8" }; 
      } else {
        return { from: "#1d4ed8", to: "#1e3a8a" }; 
      }
    } else {
      if (val <= 3) {
        return { from: "#fef08a", to: "#fbbf24" }; 
      } else if (val <= 6) {
        return { from: "#fbbf24", to: "#f97316" }; 
      } else {
        return { from: "#ea580c", to: "#b91c1c" }; 
      }
    }
  };

  const leftGrad = getEyeGradient(osSph);
  const rightGrad = getEyeGradient(odSph);

  const getPupilRadius = (val: number) => {
    const base = 15;
    const change = Math.max(-6, Math.min(6, val));
    return base + change;
  };

  const odShowAxis = Math.abs(odCyl) > 0;
  const odStrokeWidth = Math.max(1.5, Math.min(6, Math.abs(odCyl) * 1.5));

  const osShowAxis = Math.abs(osCyl) > 0;
  const osStrokeWidth = Math.max(1.5, Math.min(6, Math.abs(osCyl) * 1.5));

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner text-white h-full min-h-[350px] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" /> Sơ đồ Khúc xạ Nhãn Khoa
      </h3>
      
      <div className="flex items-center gap-10 w-full justify-center">
        {/* OD - Mắt Phải */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mắt Phải (OD)</span>
          <svg className="w-28 h-28 filter drop-shadow-xl" viewBox="0 0 100 100">
            <defs>
              <radialGradient id="grad-od" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={rightGrad.from} />
                <stop offset="100%" stopColor={rightGrad.to} />
              </radialGradient>
              <radialGradient id="sclera-grad" cx="50%" cy="50%" r="50%">
                <stop offset="70%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </radialGradient>
            </defs>
            <ellipse cx="50" cy="50" rx="46" ry="30" fill="url(#sclera-grad)" stroke="#475569" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="22" fill="url(#grad-od)" stroke="#334155" strokeWidth="1" />
            {odShowAxis && (
              <line x1="50" y1="28" x2="50" y2="72" stroke="#ef4444" strokeWidth={odStrokeWidth} transform={`rotate(${-odAx}, 50, 50)`} strokeLinecap="round" />
            )}
            <circle cx="50" cy="50" r={getPupilRadius(odSph)} fill="#090d16" />
            <circle cx="43" cy="43" r="3" fill="#ffffff" opacity="0.8" />
            <circle cx="46" cy="46" r="1.5" fill="#ffffff" opacity="0.6" />
          </svg>
          <div className="text-center mt-1">
            <span className={`text-base font-black font-mono px-3 py-1 rounded-lg ${
              odSph === 0 ? "text-emerald-400 bg-emerald-950/40" : odSph < 0 ? "text-sky-400 bg-sky-950/40" : "text-amber-400 bg-amber-950/40"
            }`}>
              {odSph > 0 ? `+${Number(odSph).toFixed(2)}` : Number(odSph).toFixed(2)} D
            </span>
          </div>
        </div>

        {/* OS - Mắt Trái */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mắt Trái (OS)</span>
          <svg className="w-28 h-28 filter drop-shadow-xl" viewBox="0 0 100 100">
            <defs>
              <radialGradient id="grad-os" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={leftGrad.from} />
                <stop offset="100%" stopColor={leftGrad.to} />
              </radialGradient>
            </defs>
            <ellipse cx="50" cy="50" rx="46" ry="30" fill="url(#sclera-grad)" stroke="#475569" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="22" fill="url(#grad-os)" stroke="#334155" strokeWidth="1" />
            {osShowAxis && (
              <line x1="50" y1="28" x2="50" y2="72" stroke="#ef4444" strokeWidth={osStrokeWidth} transform={`rotate(${-osAx}, 50, 50)`} strokeLinecap="round" />
            )}
            <circle cx="50" cy="50" r={getPupilRadius(osSph)} fill="#090d16" />
            <circle cx="43" cy="43" r="3" fill="#ffffff" opacity="0.8" />
            <circle cx="46" cy="46" r="1.5" fill="#ffffff" opacity="0.6" />
          </svg>
          <div className="text-center mt-1">
            <span className={`text-base font-black font-mono px-3 py-1 rounded-lg ${
              osSph === 0 ? "text-emerald-400 bg-emerald-950/40" : osSph < 0 ? "text-sky-400 bg-sky-950/40" : "text-amber-400 bg-amber-950/40"
            }`}>
              {osSph > 0 ? `+${Number(osSph).toFixed(2)}` : Number(osSph).toFixed(2)} D
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-800 w-full flex items-center justify-between text-xs text-slate-400 font-semibold px-4">
        <span>Khoảng cách đồng tử (PD):</span>
        <span className="text-emerald-400 text-sm font-black font-mono">{pd} mm</span>
      </div>
    </div>
  );
}

// =========================================================
// MAIN EXAMINATION CONTENT
// =========================================================
function ExaminationContent() {
  const { user, loading: authLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const ALLOWED_ROLES = ["ROLE_BAC_SI", "NH01", "ROLE_ADMIN", "NH04"];
  const hasAccess = () => {
    if (!user) return false;
    const userRoles = user?.roles || [];
    const userGroup = user?.maNhom ? user.maNhom : null;
    return ALLOWED_ROLES.some(role => userRoles.includes(role) || role === userGroup);
  };

  const mutation = useCreateHoSoKham();
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdFromUrl = searchParams.get("makh") || "";

  const [isManualInput, setIsManualInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: queueData } = useHangChoHomNay();
  const queueList = queueData || [];

  const { data: productsData } = useDanhSachSanPham();
  const productsList = productsData || [];

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      maKh: patientIdFromUrl,
      maNs: "", 
      matTraiSph: 0,
      matTraiCyl: 0,
      matTraiAx: 0,
      matPhaiSph: 0,
      matPhaiCyl: 0,
      matPhaiAx: 0,
      pd: 60,
      ketluan: "Thị lực ổn định, khúc xạ bình thường",
      maHoSo: "",
      donKinh: "",
      danhSachKinh: [],
      danhSachThuoc: [],
    },
  });

  const { fields: kinhFields, append: appendKinh, remove: removeKinh } = useFieldArray({
    control: form.control,
    name: "danhSachKinh",
  });

  const { fields: thuocFields, append: appendThuoc, remove: removeThuoc } = useFieldArray({
    control: form.control,
    name: "danhSachThuoc",
  });

  const [
    matTraiSph, matTraiCyl, matTraiAx,
    matPhaiSph, matPhaiCyl, matPhaiAx,
    pd, maKhValue
  ] = useWatch({
    control: form.control,
    name: [
      "matTraiSph", "matTraiCyl", "matTraiAx",
      "matPhaiSph", "matPhaiCyl", "matPhaiAx",
      "pd", "maKh"
    ]
  });
  
  const { data: customerDetails, isLoading: isCustomerLoading } = useKhachHang(maKhValue);
  const { data: historyData, isLoading: isHistoryLoading } = useLichSuKham(maKhValue);
  const historyList = historyData?.data || [];

  const selectedPatientFromQueue = queueList.find((p: HangChoHomNayDTO) => p.maKh === maKhValue);
  const patientNameFromHistory = historyList[0]?.tenKhachHang || "";
  const patientName = selectedPatientFromQueue?.tenKhach || customerDetails?.hoTen || patientNameFromHistory || "";

  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedOldRecord, setSelectedOldRecord] = useState<HoSoKhamResponse | null>(null);
  const [selectedNewRecord, setSelectedNewRecord] = useState<HoSoKhamResponse | null>(null);
  const [isDiffOpen, setIsDiffOpen] = useState(false);

  // Print support
  const [recordToPrint, setRecordToPrint] = useState<HoSoKhamResponse | null>(null);
  const printRecordRef = React.useRef<HTMLDivElement>(null);

  const handlePrintRecord = useReactToPrint({
    contentRef: printRecordRef,
    documentTitle: `KetQuaKham_VisionCare_${recordToPrint?.maHoSo || "New"}`,
    onAfterPrint: () => setRecordToPrint(null),
  });

  const triggerPrintRecord = (record: HoSoKhamResponse) => {
    setRecordToPrint(record);
    setTimeout(() => {
      handlePrintRecord();
    }, 150);
  };

  const maHoSoFromUrl = searchParams.get("maHoSo") || "";

  // FIX 1: Chuyển luồng set state đồng bộ sang hàng chờ vĩ mô setTimeout để dẹp sạch lỗi cascading render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      
      if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const parsedUser = JSON.parse(userStr);
            form.setValue("maNs", parsedUser.maNs || ""); 
            if (parsedUser.roles?.includes("ROLE_ADMIN") || parsedUser.maNhom === "NH04") {
              setIsAdmin(true);
            }
          } catch (err) {
            console.error("Lỗi đồng bộ tài khoản", err);
          }
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [form]);

  useEffect(() => {
    if (maHoSoFromUrl) {
      fetch(`/api/v1/examinations/${maHoSoFromUrl}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Lỗi tải hồ sơ");
        })
        .then((data: HoSoKhamResponse) => {
          const od = data.danhSachThiLuc?.find((ct: ChiTietThiLuc) => ct.loaiMat === "P");
          const os = data.danhSachThiLuc?.find((ct: ChiTietThiLuc) => ct.loaiMat === "T");
          form.reset({
            maKh: data.maKh || "",
            maNs: data.maNs || form.getValues("maNs") || "",
            matTraiSph: os?.sph ?? 0,
            matTraiCyl: os?.cyl ?? 0,
            matTraiAx: os?.axis ?? 0,
            matPhaiSph: od?.sph ?? 0,
            matPhaiCyl: od?.cyl ?? 0,
            matPhaiAx: od?.axis ?? 0,
            pd: os?.pd || od?.pd || 60,
            ketluan: data.ketLuan || "",
            maHoSo: data.maHoSo || "",
            donKinh: data.donKinh || "",
            danhSachKinh: [],
            danhSachThuoc: [],
          });
          toast.success(`📝 Đã tải dữ liệu hồ sơ ${data.maHoSo} để cập nhật!`);
        })
        .catch(() => {
          toast.error("Không thể tải hồ sơ cần chỉnh sửa");
        });
    }
  }, [maHoSoFromUrl, form]);

  if (!isMounted || authLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-blue-600 font-medium">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  if (!hasAccess()) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 m-6">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-slate-800">Truy Cập Bị Từ Chối</h2>
        <p className="text-slate-505 mt-2 max-w-md text-center text-sm text-slate-500">
          Tài khoản của bạn không có nghiệp vụ Bác sĩ. Vui lòng quay lại!
        </p>
        <Button onClick={() => router.back()} className="mt-6 bg-slate-800 hover:bg-slate-900">
          Quay lại trang trước
        </Button>
      </div>
    );
  }

  // Auto-refractor file reader
  const handleAutoRefractorFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      
      let odSph = 0; let odCyl = 0; let odAx = 0;
      let osSph = 0; let osCyl = 0; let osAx = 0;
      let pdVal = 60;

      const odMatch = text.match(/OD:?\s*SPH?\s*([+-]?\d+\.?\d*)/i) || text.match(/OD\s*([+-]?\d+\.?\d*)/i);
      const osMatch = text.match(/OS:?\s*SPH?\s*([+-]?\d+\.?\d*)/i) || text.match(/OS\s*([+-]?\d+\.?\d*)/i);
      
      const odCylMatch = text.match(/OD:?\s*.*CYL?\s*([+-]?\d+\.?\d*)/i);
      const odAxMatch = text.match(/OD:?\s*.*AX(?:IS)?\s*(\d+)/i);
      const osCylMatch = text.match(/OS:?\s*.*CYL?\s*([+-]?\d+\.?\d*)/i);
      const osAxMatch = text.match(/OS:?\s*.*AX(?:IS)?\s*(\d+)/i);

      const pdMatch = text.match(/PD:?\s*(\d+)/i);

      if (odMatch) odSph = parseFloat(odMatch[1]);
      if (osMatch) osSph = parseFloat(osMatch[1]);
      if (pdMatch) pdVal = parseInt(pdMatch[1]);
      
      if (odCylMatch) odCyl = parseFloat(odCylMatch[1]);
      if (odAxMatch) odAx = parseInt(odAxMatch[1]);
      if (osCylMatch) osCyl = parseFloat(osCylMatch[1]);
      if (osAxMatch) osAx = parseInt(osAxMatch[1]);

      form.setValue("matPhaiSph", odSph);
      form.setValue("matPhaiCyl", odCyl);
      form.setValue("matPhaiAx", odAx);
      form.setValue("matTraiSph", osSph);
      form.setValue("matTraiCyl", osCyl);
      form.setValue("matTraiAx", osAx);
      form.setValue("pd", pdVal);
      toast.success("✅ Đã nạp chỉ số tự động từ tệp máy khúc xạ!");
    };
    reader.readAsText(file);
  };

  const onSubmit = async (values: ExamFormValues) => {
    if (isAdmin) {
      toast.error("Tài khoản Quản trị viên chỉ có quyền xem, không được ghi hồ sơ khám!");
      return;
    }

    const payload: HoSoKhamRequest = {
      makh: values.maKh,
      mans: values.maNs,
      matTraiSph: Number(values.matTraiSph) || 0,
      matTraiCyl: Number(values.matTraiCyl) || 0,
      matTraiAx: Number(values.matTraiAx) || 0,
      matPhaiSph: Number(values.matPhaiSph) || 0,
      matPhaiCyl: Number(values.matPhaiCyl) || 0,
      matPhaiAx: Number(values.matPhaiAx) || 0,
      pd: Number(values.pd) || 60,
      ketluan: values.ketluan,
      maHoSo: values.maHoSo || undefined,
      donKinh: values.danhSachKinh?.length 
        ? values.danhSachKinh.map(k => productsList.find((p: SanPhamResponse) => p.maSp === k.maSp)?.tenSp).filter(Boolean).join(", ")
        : (values.donKinh || undefined),
    };

    setIsSubmitting(true);
    try {
      // 1. Lưu hồ sơ khám nhãn khoa
      const hoSoRes = await mutation.mutateAsync(payload);
      const newMaHoSo = hoSoRes.maHoSo;

      // 2. Lưu đơn thuốc/kính nếu có sản phẩm được kê
      const allItems = [...(values.danhSachKinh || []), ...(values.danhSachThuoc || [])];
      if (allItems && allItems.length > 0) {
        const validItems = allItems.filter(item => item.maSp !== "");
        if (validItems.length > 0) {
          const phieuKeDonPayload = {
            maHoSo: newMaHoSo,
            maNs: values.maNs,
            danhSachKeDon: validItems.map(item => ({
              maSp: item.maSp,
              soLuong: Number(item.soLuong) || 1
            }))
          };
          await clinicApi.createPhieuKeDon(phieuKeDonPayload);
        }
      }

      toast.success("Kê đơn và lưu hồ sơ khám bệnh thành công!");
      router.push(`/staff/clinic/queue`);
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorResponse.response?.data?.message || errorResponse.message || "Lỗi lưu hồ sơ hoặc đơn thuốc";
      toast.error(`Lỗi thực hiện: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Hồ sơ khám bệnh nhãn khoa{patientName ? ` - BN: ${patientName}` : ""}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Lập hồ sơ khúc xạ & lưu kết quả khám lâm sàng</p>
          </div>
        </div>

        {/* Actions header */}
        <div className="flex items-center gap-3">
          {maHoSoFromUrl && (
            <Button
              type="button"
              variant="outline"
              onClick={() => triggerPrintRecord(form.getValues() as any)}
              className="h-10 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm"
            >
              <Printer className="w-4.5 h-4.5" />
              <span>In kết quả hiện tại</span>
            </Button>
          )}
          {maKhValue && (
            <button
              type="button"
              onClick={() => setIsHistoryDialogOpen(true)}
              className="h-10 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl flex items-center gap-2 text-sm font-semibold border border-slate-200 shadow-sm transition-colors"
            >
              <HistoryIcon className="w-4.5 h-4.5 text-slate-500" />
              <span>Lịch sử & So sánh ({historyList.length})</span>
            </button>
          )}

          {/* File upload from auto refractor */}
          <div className="relative">
            <input
              type="file"
              accept=".txt,.json"
              id="refractor-upload"
              className="hidden"
              onChange={handleAutoRefractorFile}
              disabled={isAdmin}
            />
            <label
              htmlFor="refractor-upload"
              className={`h-10 px-4 border border-slate-200 rounded-xl bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2 text-sm font-semibold shadow-sm ${isAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Nạp tệp đo khúc xạ (.txt)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Queue selector at the top */}
      <Card className="shadow-sm border-slate-200/80 overflow-hidden bg-slate-50/50">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-800">Danh sách hàng chờ khám hôm nay</h3>
            <p className="text-xs text-slate-500">Chọn bệnh nhân để tải hồ sơ khúc xạ, lịch sử khám và kê đơn thuốc.</p>
          </div>
          <div className="flex items-center gap-3.5">
            <Select
              value={isManualInput ? "manual" : maKhValue}
              onValueChange={(val) => {
                if (val === "manual") {
                  setIsManualInput(true);
                  form.setValue("maKh", "");
                  router.replace(`/staff/clinic/examinations`);
                } else {
                  setIsManualInput(false);
                  form.setValue("maKh", val);
                  router.replace(`/staff/clinic/examinations?makh=${val}`);
                }
              }}
            >
              <SelectTrigger className="w-[300px] bg-white rounded-xl h-11 border-slate-200 text-slate-700 font-medium">
                <SelectValue placeholder="Chọn bệnh nhân chờ khám..." />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-60">
                <SelectItem value="manual" className="font-semibold text-blue-600">✍️ Tự nhập mã bệnh nhân thủ công</SelectItem>
                {queueList.map((patient: HangChoHomNayDTO) => (
                  <SelectItem key={patient.maKh + "-" + patient.maHc} value={patient.maKh}>
                    {/* FIX 2: Sửa patient.tenKh thành patient.tenKhach khớp thuộc tính DTO */}
                    {patient.maKh} - {patient.tenKhach} (STT: #{patient.soThuTu} | {patient.trangThai === "DANG_KHAM" ? "Đang khám" : "Chờ khám"})
                  </SelectItem>
                ))}
                {queueList.length === 0 && (
                  <SelectItem value="empty-queue" disabled>Không có bệnh nhân chờ khám</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Inputs Form (7 Cols) */}
        <div className="lg:col-span-7">
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg">Nhập chỉ số khúc xạ</CardTitle>
              <CardDescription>Điền chi tiết hoặc nạp từ file tệp kết quả máy đo.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="maKh" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã Bệnh nhân</FormLabel>
                        <FormControl>
                          <Input 
                            readOnly={!isManualInput || !!patientIdFromUrl} 
                            className={`font-mono h-11 ${(!isManualInput || patientIdFromUrl) ? 'bg-slate-100' : 'bg-white'}`} 
                            placeholder="Nhập mã bệnh nhân (VD: KH001)"
                            {...field} 
                          />
                        </FormControl>
                        {patientName && (
                          <div className="mt-1 text-xs font-bold text-emerald-600 bg-emerald-50/50 px-2.5 py-1 rounded-lg inline-block">
                            Họ tên: {patientName}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="maNs" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bác sĩ khám</FormLabel>
                        <FormControl>
                          <Input readOnly className="bg-slate-100 font-semibold text-blue-600 h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-6">
                    {/* Mắt Phải (OD) */}
                    <div>
                      <h3 className="font-bold flex items-center text-slate-800 uppercase text-xs tracking-wider mb-3">
                        <Eye className="w-4 h-4 mr-2 text-blue-600" /> Mắt Phải (OD)
                      </h3>
                      <div className="grid grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <FormField control={form.control} name="matPhaiSph" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-slate-500 font-semibold">Cầu độ (SPH)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.25" 
                                className="bg-white h-9" 
                                placeholder="0.00" 
                                {...field} 
                                readOnly={isAdmin}
                                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="matPhaiCyl" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-slate-500 font-semibold">Loạn độ (CYL)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.25" 
                                className="bg-white h-9" 
                                placeholder="0.00" 
                                {...field} 
                                readOnly={isAdmin}
                                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="matPhaiAx" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-slate-500 font-semibold">Trục (AXIS)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                className="bg-white h-9" 
                                placeholder="0" 
                                {...field} 
                                readOnly={isAdmin}
                                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Mắt Trái (OS) */}
                    <div>
                      <h3 className="font-bold flex items-center text-slate-800 uppercase text-xs tracking-wider mb-3">
                        <Eye className="w-4 h-4 mr-2 text-indigo-600" /> Mắt Trái (OS)
                      </h3>
                      <div className="grid grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <FormField control={form.control} name="matTraiSph" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-slate-500 font-semibold">Cầu độ (SPH)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.25" 
                                className="bg-white h-9" 
                                placeholder="0.00" 
                                {...field} 
                                readOnly={isAdmin}
                                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="matTraiCyl" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-slate-500 font-semibold">Loạn độ (CYL)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.25" 
                                className="bg-white h-9" 
                                placeholder="0.00" 
                                {...field} 
                                readOnly={isAdmin}
                                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="matTraiAx" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-slate-500 font-semibold">Trục (AXIS)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                className="bg-white h-9" 
                                placeholder="0" 
                                {...field} 
                                readOnly={isAdmin}
                                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* PD & Kết luận */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="md:col-span-1">
                        <FormField control={form.control} name="pd" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-xs text-slate-700">KC đồng tử (PD - mm)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                className="bg-white font-mono h-10" 
                                placeholder="60" 
                                {...field} 
                                readOnly={isAdmin}
                                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <div className="md:col-span-2">
                        <FormField control={form.control} name="ketluan" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-xs text-slate-700">Kết luận khám bệnh</FormLabel>
                            <FormControl>
                              <Input 
                                className="bg-white h-10 font-medium" 
                                placeholder="Nhập kết luận của bác sĩ..." 
                                {...field} 
                                readOnly={isAdmin}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                  </div>

                  {/* Kê đơn kính (Gọng & Tròng) */}
                  <div className="p-5 border border-slate-200 rounded-2xl bg-blue-50/50 space-y-4">
                    <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                      <h3 className="font-bold flex items-center text-blue-800 uppercase text-xs tracking-wider">
                        <Eye className="w-4 h-4 mr-2 text-blue-600" /> Kê đơn kính (Gọng & Tròng) - Tự động liên kết xưởng
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isAdmin}
                        onClick={() => appendKinh({ maSp: "", soLuong: 1 })}
                        className="h-8 text-xs bg-white text-slate-700 shadow-sm border-blue-200"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Thêm Gọng/Tròng
                      </Button>
                    </div>

                    {kinhFields.length === 0 ? (
                      <div className="text-center py-4 text-xs text-blue-400 font-medium italic border border-dashed border-blue-200 rounded-xl bg-white/40">
                        Chưa kê Gọng hoặc Tròng kính nào.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {kinhFields.map((item, index) => (
                          <div key={item.id} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                            <div className="flex-1">
                              <FormField control={form.control} name={`danhSachKinh.${index}.maSp`} render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-semibold text-slate-500">Sản phẩm (Gọng/Tròng)</FormLabel>
                                  <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange} disabled={isAdmin}>
                                      <SelectTrigger className="bg-white h-9 border-slate-200 text-xs">
                                        <SelectValue placeholder="Chọn Gọng / Tròng kính..." />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white max-h-60">
                                        {productsList.filter((p: SanPhamResponse) => !p.laThuoc).map((prod: SanPhamResponse) => (
                                          <SelectItem key={prod.maSp} value={prod.maSp} className="text-xs">
                                            {prod.tenSp} ({prod.maSp} - Giá: {prod.giaBan?.toLocaleString("vi-VN")}đ - Tồn: {prod.tongTonKho})
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                            </div>
                            <div className="w-24">
                              <FormField control={form.control} name={`danhSachKinh.${index}.soLuong`} render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-semibold text-slate-500">Số lượng</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      className="h-9"
                                      disabled={isAdmin}
                                      {...field}
                                      onChange={(e) => field.onChange(e.target.value === "" ? 1 : Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              disabled={isAdmin}
                              onClick={() => removeKinh(index)}
                              className="mt-6 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-9 w-9 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Kê đơn thuốc */}
                  <div className="p-5 border border-slate-200 rounded-2xl bg-emerald-50/50 space-y-4">
                    <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                      <h3 className="font-bold flex items-center text-emerald-800 uppercase text-xs tracking-wider">
                        <Stethoscope className="w-4 h-4 mr-2 text-emerald-600" /> Kê đơn thuốc (Dược phẩm)
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isAdmin}
                        onClick={() => appendThuoc({ maSp: "", soLuong: 1 })}
                        className="h-8 text-xs bg-white text-slate-700 shadow-sm border-emerald-200"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Thêm Thuốc
                      </Button>
                    </div>

                    {thuocFields.length === 0 ? (
                      <div className="text-center py-4 text-xs text-emerald-400 font-medium italic border border-dashed border-emerald-200 rounded-xl bg-white/40">
                        Chưa có thuốc nào được kê.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {thuocFields.map((item, index) => (
                          <div key={item.id} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                            <div className="flex-1">
                              <FormField control={form.control} name={`danhSachThuoc.${index}.maSp`} render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-semibold text-slate-500">Sản phẩm (Thuốc)</FormLabel>
                                  <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange} disabled={isAdmin}>
                                      <SelectTrigger className="bg-white h-9 border-slate-200 text-xs">
                                        <SelectValue placeholder="Chọn loại Thuốc..." />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white max-h-60">
                                        {productsList.filter((p: SanPhamResponse) => p.laThuoc).map((prod: SanPhamResponse) => (
                                          <SelectItem key={prod.maSp} value={prod.maSp} className="text-xs">
                                            {prod.tenSp} ({prod.maSp} - Giá: {prod.giaBan?.toLocaleString("vi-VN")}đ - Tồn: {prod.tongTonKho})
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                            </div>
                            <div className="w-24">
                              <FormField control={form.control} name={`danhSachThuoc.${index}.soLuong`} render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-semibold text-slate-500">Số lượng</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      className="h-9"
                                      disabled={isAdmin}
                                      {...field}
                                      onChange={(e) => field.onChange(e.target.value === "" ? 1 : Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              disabled={isAdmin}
                              onClick={() => removeThuoc(index)}
                              className="mt-6 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-9 w-9 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button type="submit" disabled={mutation.isPending || isSubmitting || isAdmin} className="bg-blue-600 hover:bg-blue-700 min-w-[200px] h-11 rounded-xl font-bold shadow-md shadow-blue-500/10">
                      {mutation.isPending || isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <span className="flex items-center gap-1.5">Lưu bệnh án & Đơn thuốc <ArrowRight className="w-4.5 h-4.5" /></span>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Visual & Customer Info (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <CustomerDetailsCard customer={customerDetails} isLoading={isCustomerLoading} />
          
          <EyeRefractionMap 
            osSph={Number(matTraiSph) || 0} 
            osCyl={Number(matTraiCyl) || 0}
            osAx={Number(matTraiAx) || 0}
            odSph={Number(matPhaiSph) || 0} 
            odCyl={Number(matPhaiCyl) || 0}
            odAx={Number(matPhaiAx) || 0}
            pd={Number(pd) || 60} 
          />
        </div>
      </div>

      {/* HISTORY & COMPARISON DIALOG */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-4xl bg-white rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <HistoryIcon className="w-5 h-5 text-blue-500 animate-pulse" />
              Lịch sử khám & So sánh thị lực
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs mt-1">
              Chọn tối đa 2 hồ sơ để tiến hành so sánh biến động thị lực.
            </DialogDescription>
          </DialogHeader>

          {isHistoryLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : historyList.length > 0 ? (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 mt-4">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 mb-2">
                <span className="text-xs font-semibold text-slate-500">
                  Đã chọn:{" "}
                  {selectedOldRecord && selectedNewRecord
                    ? `[${selectedOldRecord.maHoSo}] và [${selectedNewRecord.maHoSo}]`
                    : selectedOldRecord
                    ? `[${selectedOldRecord.maHoSo}]`
                    : "Chưa chọn đủ 2 hồ sơ"}
                </span>
                <Button
                  disabled={!selectedOldRecord || !selectedNewRecord}
                  onClick={() => setIsDiffOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-9 px-4 text-xs font-bold"
                >
                  Bắt đầu so sánh
                </Button>
              </div>

              <div className="space-y-3">
                {historyList.map((item: HoSoKhamResponse) => {
                  const isCheckedOld = selectedOldRecord?.maHoSo === item.maHoSo;
                  const isCheckedNew = selectedNewRecord?.maHoSo === item.maHoSo;

                  return (
                    <div
                      key={item.maHoSo}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCheckedOld || isCheckedNew
                          ? "border-blue-500 bg-blue-50/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Selection Checkboxes */}
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600">
                              <input
                                type="checkbox"
                                checked={isCheckedOld}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedOldRecord(item);
                                  } else {
                                    setSelectedOldRecord(null);
                                  }
                                }}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4.5 h-4.5"
                              />
                              <span>Cũ</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600">
                              <input
                                type="checkbox"
                                checked={isCheckedNew}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedNewRecord(item);
                                  } else {
                                    setSelectedNewRecord(null);
                                  }
                                }}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4.5 h-4.5"
                              />
                              <span>Mới</span>
                            </label>
                          </div>

                          <div className="h-4 w-px bg-slate-200" />

                          <div>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-mono">
                              Mã HS: {item.maHoSo}
                            </span>
                            <span className="text-xs font-semibold text-slate-400 ml-2">
                              {item.ngayKham
                                ? new Date(item.ngayKham).toLocaleDateString("vi-VN")
                                : "N/A"}
                            </span>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded ml-2">
                              BS: {item.tenBacSi || "Không rõ"}
                            </span>
                          </div>
                        </div>

                        {/* Print action */}
                        <Button
                          type="button"
                          onClick={() => triggerPrintRecord(item)}
                          className="h-8 px-3 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 self-end sm:self-auto"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          In A4 kết quả
                        </Button>
                      </div>

                      <div className="mt-3 pt-3 border-t border-dashed border-slate-100 grid grid-cols-2 gap-4 text-xs font-medium text-slate-600">
                        <div>
                          <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                            Mắt Phải (OD):
                          </span>
                          <span>
                            SPH:{" "}
                            {item.danhSachThiLuc?.find((ct: ChiTietThiLuc) => ct.loaiMat === "P")?.sph ||
                              "0.00"}{" "}
                            | CYL:{" "}
                            {item.danhSachThiLuc?.find((ct: ChiTietThiLuc) => ct.loaiMat === "P")?.cyl ||
                              "0.00"}{" "}
                            | AXIS:{" "}
                            {item.danhSachThiLuc?.find((ct: ChiTietThiLuc) => ct.loaiMat === "P")?.axis ||
                              "0"}{" "}
                            | VA:{" "}
                            {item.danhSachThiLuc?.find((ct: ChiTietThiLuc) => ct.loaiMat === "P")?.va ||
                              "10/10"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                            Mắt Trái (OS):
                          </span>
                          <span>
                            SPH:{" "}
                            {item.danhSachThiLuc?.find((ct: ChiTietThiLuc) => ct.loaiMat === "T")?.sph ||
                              "0.00"}{" "}
                            | CYL:{" "}
                            {item.danhSachThiLuc?.find((ct: ChiTietThiLuc) => ct.loaiMat === "T")?.cyl ||
                              "0.00"}{" "}
                            | AXIS:{" "}
                            {item.danhSachThiLuc?.find((ct: ChiTietThiLuc) => ct.loaiMat === "T")?.axis ||
                              "0"}{" "}
                            | VA:{" "}
                            {item.danhSachThiLuc?.find((ct: ChiTietThiLuc) => ct.loaiMat === "T")?.va ||
                              "10/10"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs font-medium text-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          Kết luận:
                        </span>
                        {item.ketLuan || "Không có kết luận chi tiết"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <HistoryIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-600">Không có lịch sử khám</h3>
              <p className="text-xs text-slate-400 mt-1">Bệnh nhân chưa từng khám tại trung tâm.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* RECORD DIFF COMPARISON DIALOG */}
      <RecordDiffDialog
        isOpen={isDiffOpen}
        onClose={() => setIsDiffOpen(false)}
        recordOld={selectedOldRecord}
        recordNew={selectedNewRecord}
      />

      {/* HIDDEN PRINT COMPONENT */}
      <div className="hidden">
        <PrintA4Record ref={printRecordRef} record={recordToPrint} />
      </div>
    </div>
  );
}

// =========================================================
// MAIN PAGE WRAPPER
// =========================================================
export default function ExaminationPage() {
  return (
    <Suspense fallback={
      <div className="p-10 text-center flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-slate-500 font-semibold">Đang tải hồ sơ khám bệnh...</span>
      </div>
    }>
      <ExaminationContent />
    </Suspense>
  );
}