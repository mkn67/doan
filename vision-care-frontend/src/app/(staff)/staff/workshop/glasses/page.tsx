"use client";

import * as React from "react";
import { Suspense, useEffect, useState } from "react";
import { 
  Hammer, ClipboardCheck, Loader2, Info, 
  AlertTriangle, AlertCircle, CheckCircle2, 
  RefreshCw, Plus, Minus, Search, Trash2,
  ChevronDown, ChevronUp, UserCheck, Calendar
} from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams, useRouter } from "next/navigation"; 
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

const workshopSchema = z.object({
  maDon: z.string().min(1, "Vui lòng nhập mã đơn hàng (Mã Phiếu Kê Đơn)"),
  maNsKyThuat: z.string().min(1, "Vui lòng nhập mã kỹ thuật viên"),
  trangThai: z.string().min(1, "Vui lòng chọn trạng thái"),
  ghiChu: z.string().optional(),
  ngayHoanThanh: z.string().min(1, "Vui lòng chọn ngày hoàn thành"),
});

type WorkshopFormValues = z.infer<typeof workshopSchema>;

function WorkshopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Local storage user details
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const isTechnician = user.roles?.includes("NH05") || user.maNhom === "NH05";
  const isAdmin = user.roles?.includes("NH04") || user.maNhom === "NH04";
  const currentUsername = user.username || "";

  // UI state
  const [isMounted, setIsMounted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [draggingItem, setDraggingItem] = useState<XuLyKinhResponseDTO | null>(null);
  const [activeOverColumn, setActiveOverColumn] = useState<string | null>(null);
  
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
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          form.setValue("maNsKyThuat", user.username || ""); 
        } catch (e) {
          console.error("Lỗi lấy thông tin nhân sự", e);
        }
      }
    }
  }, [form]);

  // Handle manual form submission
  const onSubmit: SubmitHandler<WorkshopFormValues> = (values) => {
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
      success: (msg: any) => msg,
      error: (err) => `Lỗi: ${err}`
    });
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, item: XuLyKinhResponseDTO) => {
    setDraggingItem(item);
    e.dataTransfer.setData("maXl", item.maXl);
    e.currentTarget.classList.add("opacity-40");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggingItem(null);
    setActiveOverColumn(null);
    e.currentTarget.classList.remove("opacity-40");
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
    const maXl = draggingItem.maXl;

    if (targetColumn === "processing") {
      if (sourceStatus === "Chờ xử lý" || sourceStatus === "Lỗi gia công") {
        triggerBatDau(maXl);
      } else {
        toast.warning("Chỉ được gia công các đơn đang ở hàng chờ hoặc gặp lỗi!");
      }
    } else if (targetColumn === "completed") {
      if (sourceStatus === "Đang xử lý") {
        triggerHoanThanh(maXl);
      } else {
        toast.warning("Chỉ được hoàn thành các đơn đang mài lắp!");
      }
    } else if (targetColumn === "failed") {
      if (sourceStatus === "Đang xử lý") {
        // Open dialog to input error description
        setNoteText("");
        setShowNoteModal({ maXl, action: "fail" });
      } else {
        toast.warning("Chỉ báo lỗi các đơn đang được mài lắp!");
      }
    } else if (targetColumn === "cancelled") {
      // Prompt cancellation notes
      setNoteText("");
      setShowNoteModal({ maXl, action: "cancel" });
    } else if (targetColumn === "pending") {
      if (sourceStatus === "Đang xử lý" || sourceStatus === "Lỗi gia công") {
        triggerUpdateStatus(maXl, "Chờ xử lý");
      }
    }
  };

  // State update actions
  const triggerBatDau = (maXl: string) => {
    const promise = new Promise((resolve, reject) => {
      batDauMutation.mutate({ maXl, maKyThuat: currentUsername }, {
        onSuccess: () => {
          // SP_GIAO_XU_LY_KINH/Bat dau updates start date. We should also update status text to "Đang xử lý".
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
      success: (msg: any) => msg,
      error: (err) => `Lỗi: ${err}`
    });
  };

  const triggerHoanThanh = (maXl: string) => {
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
      success: (msg: any) => msg,
      error: (err) => `Lỗi: ${err}`
    });
  };

  const triggerUpdateStatus = (maXl: string, trangThai: string) => {
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
      success: (msg: any) => msg,
      error: (err) => `Lỗi: ${err}`
    });
  };

  const handleModalSubmit = () => {
    if (!showNoteModal) return;
    const { maXl, action } = showNoteModal;

    if (action === "fail") {
      // Update state to Failed, setting description in notes
      const promise = new Promise((resolve, reject) => {
        // Unfortunately standard updateTrangThai endpoint doesn't edit notes in one go,
        // but we can call updateTrangThai, then optionally update notes, or just set status.
        // Let's call updateTrangThai. 
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
        success: (msg: any) => msg,
        error: (err) => `Thất bại: ${err}`
      });
    } else if (action === "cancel") {
      // Call cancel mutation
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
        success: (msg: any) => msg,
        error: (err) => `Lỗi: ${err}`
      });
    }
  };

  if (!isMounted) return null;

  // Filter lists for Kanban columns
  const pendingOrders = orders.filter(o => o.trangThai === "Chờ xử lý");
  const processingOrders = orders.filter(o => o.trangThai === "Đang xử lý");
  const failedOrders = orders.filter(o => o.trangThai === "Lỗi gia công");
  const completedOrders = orders.filter(o => o.trangThai === "Hoàn thành");

  const isActionPending = 
    createMutation.isPending || 
    batDauMutation.isPending || 
    hoanThanhMutation.isPending || 
    huyMutation.isPending || 
    updateTrangThaiMutation.isPending;

  return (
    <div className="p-6 md:p-8 space-y-6 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 min-h-[calc(100vh-4rem)] text-white relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/50 pb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-lg shadow-amber-500/20">
            <Hammer className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight">
              Quản Trị Phân Xưởng Mài Lắp
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Kỹ thuật viên quản lý tiến độ cắt mài tròng kính và lắp gọng theo toa thuốc bác sĩ.
            </p>
          </div>
        </div>

        {/* TOP LEVEL ACTIONS */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsFormOpen(!isFormOpen)}
            variant="outline"
            className="bg-slate-800/50 hover:bg-slate-700/50 text-white border-slate-700/80 hover:border-slate-600/80 h-10 px-4 rounded-xl flex items-center gap-2 transition-all duration-300"
          >
            {isFormOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isFormOpen ? "Thu gọn form" : "Giao việc thủ công"}</span>
          </Button>

          <Button
            onClick={() => refetch()}
            disabled={ordersLoading || isRefetching}
            variant="outline"
            className="bg-slate-800/50 hover:bg-slate-700/50 text-white border-slate-700/80 hover:border-slate-600/80 h-10 px-4 rounded-xl flex items-center gap-2 transition-all duration-300"
          >
            <RefreshCw className={`w-4 h-4 ${(ordersLoading || isRefetching) ? "animate-spin text-amber-400" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* COLLAPSIBLE MANUAL ENTRY FORM */}
      {isFormOpen && (
        <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-xl text-white relative z-10 shadow-xl overflow-hidden max-w-3xl">
          <CardHeader className="border-b border-slate-800/80 bg-slate-950/20">
            <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-amber-500" />
              <span>Nhập Phiếu Gia Công Kính Thủ Công</span>
            </CardTitle>
            <CardDescription className="text-slate-400">
              Chỉ dùng khi cần ghi đè hoặc tạo mới trực tiếp từ mã toa thuốc (MaDon).
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="maDon" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-300">Mã Phiếu Kê Đơn (Toa thuốc)</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: KD_S01" {...field} className="bg-slate-950/50 border-slate-800 focus:border-amber-500 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="trangThai" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-300">Trạng thái khởi tạo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-950/50 border-slate-800 focus:border-amber-500 text-white">
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
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
                      <FormLabel className="font-semibold text-slate-300">Kỹ thuật viên phụ trách</FormLabel>
                      <FormControl>
                        <Input readOnly className="bg-slate-950/30 border-slate-800 text-amber-500 font-medium" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="ngayHoanThanh" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-300">Ngày hoàn thiện dự kiến</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-slate-950/50 border-slate-800 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="ghiChu" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-slate-300">Chi tiết thông tin kỹ thuật</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="VD: Cận 2.5 độ, lắp tròng siêu mỏng, gọng kim loại tròn..." 
                        className="min-h-[90px] bg-slate-950/50 border-slate-800 focus:border-amber-500 text-white resize-none"
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
                    <Button disabled variant="outline" className="w-full h-11 text-md font-bold bg-slate-900 text-slate-500 border-slate-800">
                      Tài khoản không có quyền gia công
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* KANBAN BOARD VIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        
        {/* COLUMN 1: PENDING (Chờ xử lý) */}
        <div 
          className={`flex flex-col min-h-[550px] bg-slate-900/40 backdrop-blur-xl rounded-2xl border transition-all duration-300 ${
            activeOverColumn === "pending" 
              ? "border-slate-500/60 bg-slate-800/30" 
              : "border-slate-800/80"
          }`}
          onDragOver={(e) => handleDragOver(e, "pending")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, "pending")}
        >
          <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-950/20 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shadow-lg shadow-slate-500/50"></span>
              <h2 className="font-semibold text-slate-200">Chờ Gia Công</h2>
            </div>
            <span className="px-2.5 py-0.5 bg-slate-500/10 text-slate-400 border border-slate-500/20 text-xs font-bold rounded-full">
              {pendingOrders.length}
            </span>
          </div>

          <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-800">
            {ordersLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-slate-500 mb-2" />
                <span className="text-xs">Đang tải...</span>
              </div>
            ) : pendingOrders.length > 0 ? (
              pendingOrders.map((item) => (
                <div
                  key={item.maXl}
                  draggable={!isActionPending}
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  className="group bg-slate-950/40 hover:bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all duration-300 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-slate-600" />
                  
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500">Mã XL: {item.maXl}</span>
                      <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors text-base mt-0.5">
                        {item.tenKhachHang || "Khách Vãng Lai"}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                    <p>Toa thuốc: <span className="text-slate-300 font-bold">{item.maDon}</span></p>
                    {item.ghiChu && <p className="italic text-slate-500">Ghi chú: &ldquo;{item.ghiChu}&rdquo;</p>}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Giao Kính: {item.ngayHoanThanh ? new Date(item.ngayHoanThanh).toLocaleDateString('vi-VN') : "---"}</span>
                    </div>

                    <Button
                      onClick={() => triggerBatDau(item.maXl)}
                      disabled={isActionPending}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[10px] h-6 px-2 rounded-lg flex items-center gap-0.5 shadow-sm transition-all"
                    >
                      <Hammer className="w-3 h-3" />
                      <span>Gia Công</span>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-600 border border-dashed border-slate-800/80 rounded-xl">
                <Info className="w-8 h-8 text-slate-800 mb-2" />
                <p className="text-[11px] font-semibold text-slate-500">Hàng chờ rỗng</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: PROCESSING (Đang mài lắp) */}
        <div 
          className={`flex flex-col min-h-[550px] bg-slate-900/40 backdrop-blur-xl rounded-2xl border transition-all duration-300 ${
            activeOverColumn === "processing" 
              ? "border-amber-500/60 bg-slate-800/30" 
              : "border-slate-800/80"
          }`}
          onDragOver={(e) => handleDragOver(e, "processing")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, "processing")}
        >
          <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-950/20 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50 animate-pulse"></span>
              <h2 className="font-semibold text-slate-200">Đang Mài Lắp</h2>
            </div>
            <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold rounded-full">
              {processingOrders.length}
            </span>
          </div>

          <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-800">
            {processingOrders.length > 0 ? (
              processingOrders.map((item) => (
                <div
                  key={item.maXl}
                  draggable={!isActionPending}
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  className="group bg-slate-950/40 hover:bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all duration-300 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                  
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500">Mã XL: {item.maXl}</span>
                      <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors text-base mt-0.5">
                        {item.tenKhachHang || "Khách Vãng Lai"}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                    <p>Toa: <span className="text-slate-300 font-bold">{item.maDon}</span></p>
                    {item.tenKyThuatVien && (
                      <p className="flex items-center gap-1 text-[11px] text-amber-400">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>KTV: {item.tenKyThuatVien}</span>
                      </p>
                    )}
                    {item.ghiChu && <p className="italic text-slate-500">Ghi chú: &ldquo;{item.ghiChu}&rdquo;</p>}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Dự kiến: {item.ngayHoanThanh ? new Date(item.ngayHoanThanh).toLocaleDateString('vi-VN') : "---"}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => triggerHoanThanh(item.maXl)}
                        disabled={isActionPending}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] h-6 px-1.5 rounded-lg flex items-center gap-0.5 transition-all"
                      >
                        <span>Xong</span>
                      </Button>
                      <Button
                        onClick={() => {
                          setNoteText("");
                          setShowNoteModal({ maXl: item.maXl, action: "fail" });
                        }}
                        disabled={isActionPending}
                        variant="destructive"
                        size="sm"
                        className="font-semibold text-[10px] h-6 px-1.5 rounded-lg flex items-center gap-0.5 transition-all"
                      >
                        <span>Lỗi</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-600 border border-dashed border-slate-800/80 rounded-xl">
                <Info className="w-8 h-8 text-slate-800 mb-2" />
                <p className="text-[11px] font-semibold text-slate-500">Kéo đơn vào đây để tiếp nhận mài lắp</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: FAILURE (Lỗi gia công) */}
        <div 
          className={`flex flex-col min-h-[550px] bg-slate-900/40 backdrop-blur-xl rounded-2xl border transition-all duration-300 ${
            activeOverColumn === "failed" 
              ? "border-rose-500/60 bg-slate-800/30" 
              : "border-slate-800/80"
          }`}
          onDragOver={(e) => handleDragOver(e, "failed")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, "failed")}
        >
          <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-950/20 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50 animate-pulse"></span>
              <h2 className="font-semibold text-slate-200">Lỗi Gia Công</h2>
            </div>
            <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold rounded-full">
              {failedOrders.length}
            </span>
          </div>

          <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-800">
            {failedOrders.length > 0 ? (
              failedOrders.map((item) => (
                <div
                  key={item.maXl}
                  draggable={!isActionPending}
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  className="group bg-slate-950/40 hover:bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all duration-300 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                  
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500">Mã XL: {item.maXl}</span>
                      <h3 className="font-bold text-white group-hover:text-rose-400 transition-colors text-base mt-0.5">
                        {item.tenKhachHang || "Khách Vãng Lai"}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                    <p>Toa: <span className="text-slate-300 font-bold">{item.maDon}</span></p>
                    {item.ghiChu && (
                      <div className="p-2 bg-rose-950/20 border border-rose-900/30 rounded text-rose-300 text-[11px] mt-1">
                        Sự cố: &ldquo;{item.ghiChu}&rdquo;
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Cần sửa đổi lại</span>
                    </div>

                    <Button
                      onClick={() => triggerBatDau(item.maXl)}
                      disabled={isActionPending}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[10px] h-6 px-2 rounded-lg flex items-center gap-0.5 transition-all"
                    >
                      <Hammer className="w-3 h-3" />
                      <span>Mài Lại</span>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-600 border border-dashed border-slate-800/80 rounded-xl">
                <Info className="w-8 h-8 text-slate-800 mb-2" />
                <p className="text-[11px] font-semibold text-slate-500">Không có đơn bị báo lỗi gia công</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 4: COMPLETED (Đã hoàn thành) */}
        <div 
          className={`flex flex-col min-h-[550px] bg-slate-900/40 backdrop-blur-xl rounded-2xl border transition-all duration-300 ${
            activeOverColumn === "completed" 
              ? "border-emerald-500/60 bg-slate-800/30" 
              : "border-slate-800/80"
          }`}
          onDragOver={(e) => handleDragOver(e, "completed")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, "completed")}
        >
          <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-950/20 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
              <h2 className="font-semibold text-slate-200">Đã Hoàn Thành</h2>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">
              {completedOrders.length}
            </span>
          </div>

          <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-800">
            {completedOrders.length > 0 ? (
              completedOrders.map((item) => (
                <div
                  key={item.maXl}
                  className="group bg-slate-950/20 border border-slate-800/60 rounded-xl p-4 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                  
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500">Mã XL: {item.maXl}</span>
                      <h3 className="font-bold text-slate-400 group-hover:text-emerald-400 transition-colors text-base mt-0.5">
                        {item.tenKhachHang || "Khách Vãng Lai"}
                      </h3>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500">
                    <p>Toa: <span className="text-slate-400 font-bold">{item.maDon}</span></p>
                    {item.tenKyThuatVien && <p>Người lắp: <span className="text-slate-400">{item.tenKyThuatVien}</span></p>}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-900 pt-3 mt-3">
                    <span className="text-[10px] text-slate-600">Sẵn sàng thanh toán / giao nhận</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-600 border border-dashed border-slate-800/80 rounded-xl">
                <Info className="w-8 h-8 text-slate-800 mb-2" />
                <p className="text-[11px] font-semibold text-slate-500">Chưa có đơn hoàn tất hôm nay</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* LOWER TRASH ZONE: DROP HERE TO CANCEL ORDER */}
      <div 
        className={`mt-8 border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 relative z-10 flex flex-col items-center justify-center ${
          activeOverColumn === "cancelled"
            ? "border-rose-500 bg-rose-500/10 text-rose-400 scale-[1.01] shadow-lg shadow-rose-500/10"
            : "border-slate-800/60 bg-slate-900/10 text-slate-500 hover:border-slate-700/60 hover:text-slate-400"
        }`}
        onDragOver={(e) => handleDragOver(e, "cancelled")}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, "cancelled")}
      >
        <Trash2 className={`w-10 h-10 mb-2 transition-transform duration-300 ${activeOverColumn === "cancelled" ? "scale-110 text-rose-500 animate-bounce" : "text-slate-600"}`} />
        <h3 className="font-bold text-sm text-slate-300">Khu vực hủy bỏ đơn gia công</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Kéo thả bất kỳ thẻ gia công nào vào đây để <b>Hủy Đơn</b>. Thao tác này sẽ cập nhật trạng thái đơn thành &ldquo;Đã hủy&rdquo;.
        </p>
      </div>

      {/* MODAL FOR NOTES (FAILURES AND CANCELLATIONS) */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${showNoteModal.action === "fail" ? "bg-rose-500/20 text-rose-500" : "bg-orange-500/20 text-orange-500"}`}>
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">
                {showNoteModal.action === "fail" ? "Báo cáo sự cố gia công" : "Nhập lý do hủy đơn"}
              </h3>
            </div>
            
            <p className="text-sm text-slate-400">
              {showNoteModal.action === "fail" 
                ? "Mô tả nguyên nhân dẫn đến lỗi lắp ráp (trầy xước, lắp sai thông số tròng mắt kính):" 
                : "Vui lòng cung cấp lý do chi tiết hủy bỏ đơn gia công này:"}
            </p>

            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="VD: Tròng kính cận phải bị mẻ góc khi mài..."
              className="bg-slate-950 border-slate-800 text-white min-h-[90px] focus:border-amber-500 resize-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                onClick={() => setShowNoteModal(null)}
                variant="outline"
                className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
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
      <div className="flex items-center justify-center min-h-[400px] bg-slate-950 min-h-screen text-white">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto" />
          <p className="text-slate-400 font-medium">Đang tải phân xưởng mài lắp...</p>
        </div>
      </div>
    }>
      <WorkshopContent />
    </Suspense>
  );
}