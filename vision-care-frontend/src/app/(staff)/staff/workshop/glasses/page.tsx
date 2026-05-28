"use client";

import * as React from "react";
import { Suspense, useEffect, useState } from "react";
import { 
  Hammer, ClipboardCheck, Loader2, Info, 
  AlertTriangle, AlertCircle, CheckCircle2, 
  RefreshCw, Plus, Minus, Trash2, UserCheck, Calendar
} from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams } from "next/navigation"; 
import { AxiosError } from "axios";

import { 
  useXuLyKinhCanXuLy,
  useCreateXuLyKinh, 
  useBatDauXuLyKinh, 
  useHoanThanhXuLyKinh, 
  useHuyXuLyKinh, 
  useUpdateTrangThaiXuLyKinh 
} from "@/hooks/useWorkshop"; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { XuLyKinhResponseDTO } from "@/types/staff";

// =========================================================
// SCHEMA & TYPES
// =========================================================
interface JavaErrorResponse {
  message?: string;
}

interface UserData {
  username?: string;
  roles?: string[];
  maNhom?: string;
}

type FilterType = "all" | "Chờ xử lý" | "Đang xử lý" | "Lỗi gia công" | "Hoàn thành";

const workshopSchema = z.object({
  maDon: z.string().min(1, "Vui lòng nhập mã đơn hàng (Mã Phiếu Kê Đơn)"),
  maNsKyThuat: z.string().min(1, "Vui lòng nhập mã kỹ thuật viên"),
  trangThai: z.string().min(1, "Vui lòng chọn trạng thái"),
  ghiChu: z.string().optional(),
  ngayHoanThanh: z.string().min(1, "Vui lòng chọn ngày hoàn thành"),
});

type WorkshopFormValues = z.infer<typeof workshopSchema>;

function WorkshopContent() {
  const searchParams = useSearchParams();
  
  // UI state & Hydration Fix State
  const [isMounted, setIsMounted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userData, setUserData] = useState<UserData>({});
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");
  
  // Role & Details computed reactively from state to prevent hydration mismatch
  const isTechnician = userData.roles?.includes("NH05") || userData.maNhom === "NH05";
  const isAdmin = userData.roles?.includes("NH04") || userData.maNhom === "NH04";
  const isWarehouse = userData.roles?.includes("NH03") || userData.maNhom === "NH03" || userData.roles?.includes("ROLE_THU_KHO") || userData.maNhom === "ROLE_THU_KHO";
  const currentUsername = userData.username || "";

  // Custom dialog state for note updates (failures / cancellations)
  const [showNoteModal, setShowNoteModal] = useState<{
    maXl: string;
    action: "fail" | "cancel";
  } | null>(null);
  const [noteText, setNoteText] = useState("");

  // Query and Mutation hooks
  const { data: activeOrdersList, isLoading: ordersLoading, refetch, isRefetching } = useXuLyKinhCanXuLy();
  const createMutation = useCreateXuLyKinh();
  const batDauMutation = useBatDauXuLyKinh();
  const hoanThanhMutation = useHoanThanhXuLyKinh();
  const huyMutation = useHuyXuLyKinh();
  const updateTrangThaiMutation = useUpdateTrangThaiXuLyKinh();

  const orders: XuLyKinhResponseDTO[] = activeOrdersList || [];

  // Lấy mã đơn từ URL (?maDon=...)
  const maDonFromUrl = searchParams.get("maDon") || "";

  const form = useForm<WorkshopFormValues>({
    resolver: zodResolver(workshopSchema),
    defaultValues: {
      maDon: maDonFromUrl,
      maNsKyThuat: "", 
      trangThai: "Chờ xử lý",
      ngayHoanThanh: new Date().toISOString().split('T')[0],
      ghiChu: "",
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      
      if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const parsedUser = JSON.parse(userStr);
            setUserData(parsedUser);
            form.setValue("maNsKyThuat", parsedUser.username || ""); 
          } catch (e) {
            console.error("Lỗi lấy thông tin nhân sự", e);
          }
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [form]);

  // Handle manual form submission
  const onSubmit: SubmitHandler<WorkshopFormValues> = (values) => {
    if (isWarehouse) {
      toast.error("Thủ kho không được phép giao việc hoặc xử lý kính!");
      return;
    }

    const payload = {
      maDon: values.maDon,
      maNsKyThuat: values.maNsKyThuat,
      trangThai: values.trangThai,
      ghiChu: values.ghiChu,
      ngayHoanThanh: `${values.ngayHoanThanh}T17:00:00`,
      thongSoKinh: {},
    };

    const promise = new Promise((resolve, reject) => {
      createMutation.mutate(payload, {
        onSuccess: () => {
          resolve("Đã cập nhật trạng thái gia công!");
          form.reset({
            maDon: "",
            maNsKyThuat: currentUsername,
            trangThai: "Chờ xử lý",
            ngayHoanThanh: new Date().toISOString().split('T')[0],
            ghiChu: "",
          });
          setIsFormOpen(false);
          refetch();
        },
        onError: (err) => {
          const axiosError = err as AxiosError<JavaErrorResponse>;
          reject(axiosError.response?.data?.message || "Không thể lưu kết quả.");
        }
      });
    });

    toast.promise(promise, {
      loading: "Đang lưu kết quả gia công...",
      success: (msg: unknown) => typeof msg === "string" ? msg : "Thành công",
      error: (err) => `Lỗi: ${err}`
    });
  };

  // State update actions
  const triggerBatDau = (maXl: string) => {
    if (isWarehouse) return;
    const promise = new Promise((resolve, reject) => {
      batDauMutation.mutate({ maXl, maKyThuat: currentUsername }, {
        onSuccess: () => {
          updateTrangThaiMutation.mutate({ maXl, trangThai: "Đang xử lý" }, {
            onSuccess: () => {
              resolve("Đã tiếp nhận và bắt đầu mài lắp kính!");
              refetch();
            },
            onError: (err) => reject("Lỗi cập nhật trạng thái: " + err.message)
          });
        },
        onError: (err) => reject(err.message)
      });
    });

    toast.promise(promise, {
      loading: "Đang phân công kỹ thuật viên...",
      success: (msg: unknown) => typeof msg === "string" ? msg : "Thành công",
      error: (err) => `Lỗi: ${err}`
    });
  };

  const triggerHoanThanh = (maXl: string) => {
    if (isWarehouse) return;
    const promise = new Promise((resolve, reject) => {
      hoanThanhMutation.mutate(maXl, {
        onSuccess: () => {
          resolve("Đã hoàn thành lắp kính!");
          refetch();
        },
        onError: (err) => reject(err.message)
      });
    });

    toast.promise(promise, {
      loading: "Đang xác nhận hoàn tất...",
      success: (msg: unknown) => typeof msg === "string" ? msg : "Thành công",
      error: (err) => `Lỗi: ${err}`
    });
  };

  const triggerUpdateStatus = (maXl: string, trangThai: string) => {
    if (isWarehouse) return;
    const promise = new Promise((resolve, reject) => {
      updateTrangThaiMutation.mutate({ maXl, trangThai }, {
        onSuccess: () => {
          resolve(`Cập nhật trạng thái sang "${trangThai}" thành công!`);
          refetch();
        },
        onError: (err) => reject(err.message)
      });
    });

    toast.promise(promise, {
      loading: "Đang cập nhật trạng thái...",
      success: (msg: unknown) => typeof msg === "string" ? msg : "Thành công",
      error: (err) => `Lỗi: ${err}`
    });
  };

  const handleModalSubmit = () => {
    if (!showNoteModal || isWarehouse) return;
    const { maXl, action } = showNoteModal;

    if (action === "fail") {
      const promise = new Promise((resolve, reject) => {
        updateTrangThaiMutation.mutate({ maXl, trangThai: "Lỗi gia công" }, {
          onSuccess: () => {
            resolve("Đã báo cáo sự cố gia công kính.");
            setShowNoteModal(null);
            refetch();
          },
          onError: (err) => reject(err.message)
        });
      });

      toast.promise(promise, {
        loading: "Đang cập nhật lỗi kỹ thuật...",
        success: (msg: unknown) => typeof msg === "string" ? msg : "Thành công",
        error: (err) => `Thất bại: ${err}`
      });
    } else if (action === "cancel") {
      const promise = new Promise((resolve, reject) => {
        huyMutation.mutate({ maXl, lyDo: noteText }, {
          onSuccess: () => {
            resolve("Đã hủy đơn gia công!");
            setShowNoteModal(null);
            refetch();
          },
          onError: (err) => reject(err.message)
        });
      });

      toast.promise(promise, {
        loading: "Đang hủy đơn gia công...",
        success: (msg: unknown) => typeof msg === "string" ? msg : "Thành công",
        error: (err) => `Lỗi: ${err}`
      });
    }
  };

  if (!isMounted) return null;

  if (isWarehouse) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center space-y-4 min-h-[60vh] bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-rose-500 animate-bounce" />
        <h2 className="text-xl font-bold text-slate-800">Không có quyền truy cập</h2>
        <p className="text-slate-500">Bạn đăng nhập bằng tài khoản Thủ kho (Warehouse), không được phép vào quản trị Xưởng mài lắp kính!</p>
      </div>
    );
  }

  // Count states for Tabs badges
  const countPending = orders.filter(o => o.trangThai === "Chờ xử lý").length;
  const countProcessing = orders.filter(o => o.trangThai === "Đang xử lý").length;
  const countFailed = orders.filter(o => o.trangThai === "Lỗi gia công").length;
  const countCompleted = orders.filter(o => o.trangThai === "Hoàn thành").length;

  // Filter list conditionally based on Active Tab
  const filteredOrders = currentFilter === "all" 
    ? orders 
    : orders.filter(o => o.trangThai === currentFilter);

  const isActionPending = 
    createMutation.isPending || 
    batDauMutation.isPending || 
    hoanThanhMutation.isPending || 
    huyMutation.isPending || 
    updateTrangThaiMutation.isPending;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Chờ xử lý":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">Chờ gia công</span>;
      case "Đang xử lý":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">Đang mài lắp</span>;
      case "Lỗi gia công":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-50 text-rose-600 border border-rose-200">Lỗi kỹ thuật</span>;
      case "Hoàn thành":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Hoàn thành</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)] text-slate-900 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-lg shadow-amber-500/20">
            <Hammer className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Quản Trị Phân Xưởng Mài Lắp
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Hệ thống xử lý tiến độ cắt mài tròng kính và lắp gọng theo toa thuốc bác sĩ dạng bảng biểu cổ điển.
            </p>
          </div>
        </div>

        {/* TOP LEVEL ACTIONS */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsFormOpen(!isFormOpen)}
            variant="outline"
            className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 h-10 px-4 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-sm"
          >
            {isFormOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isFormOpen ? "Thu gọn form" : "Giao việc thủ công"}</span>
          </Button>

          <Button
            onClick={() => refetch()}
            disabled={ordersLoading || isRefetching}
            variant="outline"
            className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 h-10 px-4 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${(ordersLoading || isRefetching) ? "animate-spin text-amber-600" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* COLLAPSIBLE MANUAL ENTRY FORM */}
      {isFormOpen && (
        <Card className="border-slate-200 bg-white text-slate-900 relative z-10 shadow-md overflow-hidden max-w-3xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-amber-600" />
              <span>Nhập Phiếu Gia Công Kính Thủ Công</span>
            </CardTitle>
            <CardDescription className="text-slate-500">
              Chỉ dùng khi cần ghi đè hoặc tạo mới trực tiếp từ mã toa thuốc (MaDon).
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="maDon" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Mã Phiếu Kê Đơn (Toa thuốc)</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: KD_S01" {...field} className="bg-slate-50 border-slate-200 focus:border-amber-500 text-slate-900" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="trangThai" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Trạng thái khởi tạo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-50 border-slate-200 focus:border-amber-500 text-slate-900">
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-slate-200 text-slate-900">
                          <SelectItem value="Chờ xử lý">Chờ xử lý</SelectItem>
                          <SelectItem value="Đang xử lý">Đang xử lý</SelectItem>
                          <SelectItem value="Lỗi gia công">Lỗi gia công</SelectItem>
                          <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="maNsKyThuat" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Kỹ thuật viên phụ trách</FormLabel>
                      <FormControl>
                        <Input readOnly className="bg-slate-100 border-slate-200 text-amber-600 font-medium" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="ngayHoanThanh" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Ngày hoàn thiện dự kiến</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-slate-50 border-slate-200 text-slate-900" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="ghiChu" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-slate-700">Chi tiết thông tin kỹ thuật</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="VD: Cận 2.5 độ, lắp tròng siêu mỏng, gọng kim loại tròn..." 
                        className="min-h-[90px] bg-slate-50 border-slate-200 focus:border-amber-500 text-slate-900 resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex flex-col gap-3 pt-2">
                  {(isTechnician || isAdmin) ? (
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending} 
                      className="w-full bg-amber-600 hover:bg-amber-500 h-11 text-md font-bold shadow-md transition-all active:scale-95 text-white"
                    >
                      {createMutation.isPending ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tạo phiếu...</>
                      ) : (
                        <><ClipboardCheck className="mr-2 h-5 w-5" /> Giao việc & Lưu phiếu</>
                      )}
                    </Button>
                  ) : (
                    <Button disabled variant="outline" className="w-full h-11 text-md font-bold bg-slate-100 text-slate-400 border-slate-200">
                      Tài khoản không có quyền gia công
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* CLASSIC BUT GOLD FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-200/60 p-1.5 rounded-xl border border-slate-200/80 backdrop-blur-xl relative z-10">
        <button
          onClick={() => setCurrentFilter("all")}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${currentFilter === "all" ? "bg-amber-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
        >
          <span>Tất cả</span>
          <span className={`px-2 py-0.5 text-xs rounded-md ${currentFilter === "all" ? "bg-amber-700 text-amber-100" : "bg-slate-300/70 text-slate-700"}`}>{orders.length}</span>
        </button>
        <button
          onClick={() => setCurrentFilter("Chờ xử lý")}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${currentFilter === "Chờ xử lý" ? "bg-slate-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
        >
          <span>Chờ gia công</span>
          <span className={`px-2 py-0.5 text-xs rounded-md ${currentFilter === "Chờ xử lý" ? "bg-slate-800 text-slate-100" : "bg-slate-300/70 text-slate-700"}`}>{countPending}</span>
        </button>
        <button
          onClick={() => setCurrentFilter("Đang xử lý")}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${currentFilter === "Đang xử lý" ? "bg-amber-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
        >
          <span>Đang mài lắp</span>
          <span className={`px-2 py-0.5 text-xs rounded-md ${currentFilter === "Đang xử lý" ? "bg-amber-700 text-amber-100" : "bg-slate-300/70 text-slate-700"}`}>{countProcessing}</span>
        </button>
        <button
          onClick={() => setCurrentFilter("Lỗi gia công")}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${currentFilter === "Lỗi gia công" ? "bg-rose-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"}`}
        >
          <span>Lỗi kỹ thuật</span>
          <span className={`px-2 py-0.5 text-xs rounded-md ${currentFilter === "Lỗi gia công" ? "bg-rose-800 text-rose-100" : "bg-slate-300/70 text-slate-700"}`}>{countFailed}</span>
        </button>
        <button
          onClick={() => setCurrentFilter("Hoàn thành")}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${currentFilter === "Hoàn thành" ? "bg-emerald-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-100"}`}
        >
          <span>Hoàn thành</span>
          <span className={`px-2 py-0.5 text-xs rounded-md ${currentFilter === "Hoàn thành" ? "bg-emerald-800 text-emerald-100" : "bg-slate-300/70 text-slate-700"}`}>{countCompleted}</span>
        </button>
      </div>

      {/* CLASSIC DATA TABLE VIEW */}
      <Card className="border-slate-200 bg-white text-slate-900 relative z-10 shadow-md overflow-hidden">
        <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="p-4 pl-6">Mã XL</th>
                <th className="p-4">Toa thuốc</th>
                <th className="p-4">Tên khách hàng</th>
                <th className="p-4">Kỹ thuật viên</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Hạn hoàn thành</th>
                <th className="p-4 max-w-[200px]">Ghi chú / Sự cố</th>
                <th className="p-4 pr-6 text-right">Thao tác hệ thống</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {ordersLoading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                      <span>Đang đồng bộ dữ liệu phân xưởng...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((item) => (
                  <tr key={item.maXl} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 pl-6 font-mono text-xs text-slate-400 group-hover:text-amber-600 transition-colors">
                      {item.maXl}
                    </td>
                    <td className="p-4 font-bold text-slate-700">
                      {item.maDon}
                    </td>
                    <td className="p-4 font-semibold text-slate-900">
                      {item.tenKhachHang || "Khách Vãng Lai"}
                    </td>
                    <td className="p-4">
                      {item.tenKyThuatVien ? (
                        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md w-fit">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{item.tenKyThuatVien}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Chưa phân công</span>
                      )}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(item.trangThai)}
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.ngayHoanThanh ? new Date(item.ngayHoanThanh).toLocaleDateString('vi-VN') : "---"}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-600 max-w-[200px] truncate" title={item.ghiChu || ""}>
                      {item.trangThai === "Lỗi gia công" ? (
                        <span className="text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-200 block overflow-hidden text-ellipsis">
                          {item.ghiChu || "Lỗi chưa rõ nguyên nhân"}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">{item.ghiChu || "---"}</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* BUTTONS FOR PENDING STATE */}
                        {item.trangThai === "Chờ xử lý" && (
                          <>
                            <Button
                              onClick={() => triggerBatDau(item.maXl)}
                              disabled={isActionPending}
                              size="sm"
                              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs h-8 px-3 rounded-lg flex items-center gap-1 shadow-sm"
                            >
                              <Hammer className="w-3.5 h-3.5" />
                              <span>Bắt đầu mài</span>
                            </Button>
                            <Button
                              onClick={() => {
                                setNoteText("");
                                setShowNoteModal({ maXl: item.maXl, action: "cancel" });
                              }}
                              disabled={isActionPending}
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg flex items-center justify-center bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 transition-colors"
                              title="Hủy đơn gia công"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}

                        {/* BUTTONS FOR PROCESSING STATE */}
                        {item.trangThai === "Đang xử lý" && (
                          <>
                            <Button
                              onClick={() => triggerHoanThanh(item.maXl)}
                              disabled={isActionPending}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 px-3 rounded-lg flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Hoàn thành</span>
                            </Button>
                            <Button
                              onClick={() => {
                                setNoteText("");
                                setShowNoteModal({ maXl: item.maXl, action: "fail" });
                              }}
                              disabled={isActionPending}
                              size="sm"
                              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-8 px-3 rounded-lg flex items-center gap-1 shadow-sm"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Báo lỗi</span>
                            </Button>
                            <Button
                              onClick={() => triggerUpdateStatus(item.maXl, "Chờ xử lý")}
                              disabled={isActionPending}
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg flex items-center justify-center border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
                              title="Trả về hàng chờ"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}

                        {/* BUTTONS FOR FAILED STATE */}
                        {item.trangThai === "Lỗi gia công" && (
                          <>
                            <Button
                              onClick={() => triggerBatDau(item.maXl)}
                              disabled={isActionPending}
                              size="sm"
                              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs h-8 px-3 rounded-lg flex items-center gap-1 shadow-sm"
                            >
                              <Hammer className="w-3.5 h-3.5" />
                              <span>Gia công lại</span>
                            </Button>
                            <Button
                              onClick={() => {
                                setNoteText("");
                                setShowNoteModal({ maXl: item.maXl, action: "cancel" });
                              }}
                              disabled={isActionPending}
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg flex items-center justify-center bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 transition-colors"
                              title="Hủy đơn gia công"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}

                        {/* STATUS FOR COMPLETED STATE */}
                        {item.trangThai === "Hoàn thành" && (
                          <div className="flex items-center gap-1 text-emerald-700 font-medium text-xs bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Sẵn sàng giao trả</span>
                          </div>
                        )}

                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Info className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-500">Không tìm thấy đơn gia công nào thuộc trạng thái này</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL FOR NOTES (FAILURES AND CANCELLATIONS) */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl text-slate-900">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${showNoteModal.action === "fail" ? "bg-rose-50 text-rose-600" : "bg-orange-50 text-orange-600"}`}>
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                {showNoteModal.action === "fail" ? "Báo cáo sự cố gia công" : "Nhập lý do hủy đơn"}
              </h3>
            </div>
            
            <p className="text-sm text-slate-500">
              {showNoteModal.action === "fail" 
                ? "Mô tả nguyên nhân dẫn đến lỗi lắp ráp (trầy xước, lắp sai thông số tròng mắt kính):" 
                : "Vui lòng cung cấp lý do chi tiết hủy bỏ đơn gia công này:"}
            </p>

            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="VD: Tròng kính cận phải bị mẻ góc khi mài..."
              className="bg-slate-50 border-slate-200 text-slate-900 min-h-[90px] focus:border-amber-500 resize-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                onClick={() => setShowNoteModal(null)}
                variant="outline"
                className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleModalSubmit}
                className={showNoteModal.action === "fail" ? "bg-rose-600 hover:bg-rose-500 text-white" : "bg-amber-600 hover:bg-amber-500 text-white"}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================
// MAIN PAGE WRAPPER
// =========================================================
export default function WorkshopGlassesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center bg-slate-50 min-h-screen text-slate-900">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-amber-600 mx-auto" />
          <p className="text-slate-500 font-medium">Đang tải phân xưởng mài lắp...</p>
        </div>
      </div>
    }>
      <WorkshopContent />
    </Suspense>
  );
}