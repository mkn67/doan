"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, Plus, Search, 
  MoreHorizontal, CheckCircle2, XCircle, Timer, Loader2,
  Check, X, ShieldAlert, User, Phone, MapPin, Sparkles
} from "lucide-react";
import { useForm, SubmitHandler, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { useDatLich, useDanhSachDichVu, useBacSi } from "@/hooks/useClinic"; 
import { useDanhSachLichHen, useSlotTrong, useUpdateTrangThaiLichHen, useCheckInLichHen } from "@/hooks/useStaff"; 
import { useDanhSachKhachHang, useCreateKhachHang } from "@/hooks/useCustomer";
import { LichHenFilterDTO, SlotTrongDTO, LichHenResponseDTO } from "@/types/staff";
import { DatLichRequest, DichVuKhamResponse } from "@/types/clinic";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- INTERFACES ---
interface PageResponseDTO<T> {
  content?: T[];
  data?: T[];
}

type UI_LichHen = LichHenResponseDTO & {
  maKh?: string;
  tenKhachHang?: string;
  sdtKhachHang?: string;
  tenGoiKham?: string;
  tenDv?: string;
};

const bookingSchema = z.object({
  maKh: z.string().optional(),
  maGoi: z.string().min(1, "Vui lòng chọn gói khám"),
  maNs: z.string().min(1, "Vui lòng chọn bác sĩ"),
  ngayHen: z.string().min(1, "Vui lòng chọn ngày"),
  gioHen: z.string().min(1, "Vui lòng chọn giờ"),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

// Allowed roles for this page: Receptionist Only
const ALLOWED_ROLES = ["ROLE_LE_TAN", "NH06", "ROLE_ADMIN", "NH04"];

export default function AppointmentsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const { user, loading: authLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");
  const [hidePast, setHidePast] = useState(false);

  // Booking customer tabs state
  const [bookingTab, setBookingTab] = useState<"existing" | "new">("existing");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<{ maKh: string; hoTen: string; sdt: string } | null>(null);

  // New customer form state
  const [newKhName, setNewKhName] = useState("");
  const [newKhPhone, setNewKhPhone] = useState("");
  const [newKhAddress, setNewKhAddress] = useState("");

  const filters: LichHenFilterDTO = {
    keyword: searchKeyword || undefined,
    tuNgay: filterDate || undefined,
    denNgay: filterDate || undefined,
    maNs: (filterDoctor && filterDoctor !== "ALL_DOCTORS") ? filterDoctor : undefined,
    page: 0,
    size: 100
  };

  const { data: listLichHen, isLoading: loadingLich } = useDanhSachLichHen(filters);
  const { data: listGoiKham } = useDanhSachDichVu();
  const { data: doctorsData } = useBacSi();
  const datLichMutation = useDatLich();
  const updateStatusMutation = useUpdateTrangThaiLichHen();
  const createKhachHangMutation = useCreateKhachHang();
  const checkInMutation = useCheckInLichHen();

  // Load existing customers for search
  const { data: searchCustomersResult } = useDanhSachKhachHang({ keyword: customerSearch || undefined });
  const customersList = searchCustomersResult || [];

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { maKh: "", maGoi: "", maNs: "", ngayHen: "", gioHen: "" }
  });

  const formatSlotTime = (val: number) => {
    const hour = Math.floor(val);
    const minutes = Math.round((val - hour) * 60);
    const hh = String(hour).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const selectedDate = useWatch({ control: form.control, name: "ngayHen" });
  const selectedDoctor = useWatch({ control: form.control, name: "maNs" });
  const { data: slotsTrong } = useSlotTrong(selectedDate, selectedDoctor);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const hasAccess = () => {
    if (!user) return false;
    const userRoles = user?.roles || [];
    const userGroup = user?.maNhom ? user.maNhom : null;
    return ALLOWED_ROLES.some(role => userRoles.includes(role) || role === userGroup);
  };

  if (!isMounted || authLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-blue-600 font-medium">
        Đang kiểm tra quyền truy cập lịch hẹn...
      </div>
    );
  }

  if (!hasAccess()) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 m-6">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-slate-800">Truy Cập Bị Từ Chối</h2>
        <p className="text-slate-500 mt-2 max-w-md text-center">
          Tài khoản <b>{user?.username}</b> không có nghiệp vụ Lễ tân. Vui lòng quay lại khu vực làm việc của bạn!
        </p>
        <Button onClick={() => router.back()} className="mt-6 bg-slate-800 hover:bg-slate-900">
          Quay lại trang trước
        </Button>
      </div>
    );
  }

  const isAdmin = user?.roles?.includes("ROLE_ADMIN") || user?.maNhom === "NH04";

  const arrGoiKham: DichVuKhamResponse[] = 
    (listGoiKham as PageResponseDTO<DichVuKhamResponse>)?.content || 
    (listGoiKham as PageResponseDTO<DichVuKhamResponse>)?.data || 
    (Array.isArray(listGoiKham) ? listGoiKham : []);

  const now = new Date();
  const rawLichHen: UI_LichHen[] = 
    (listLichHen as PageResponseDTO<UI_LichHen>)?.content || 
    (listLichHen as PageResponseDTO<UI_LichHen>)?.data || 
    (Array.isArray(listLichHen) ? listLichHen : []);

  // Bỏ những lịch hẹn đã hết thời gian (quá giờ/ngày cũ) mà chưa được duyệt (trạng thái là "Chờ xác nhận")
  const filteredRawLichHen = rawLichHen.filter(item => {
    if (!item.ngayHen || !item.gioHen) return true;
    try {
      const apptTime = new Date(`${item.ngayHen}T${item.gioHen}`);
      const isPast = apptTime < now;
      const isUnapproved = item.trangThai === "CHO_XAC_NHAN" || item.trangThai === "Chờ xác nhận";
      if (isPast && isUnapproved) {
        return false; // Bỏ đi khỏi list
      }
      return true;
    } catch (e) {
      return true;
    }
  });

  const arrLichHen = hidePast 
    ? filteredRawLichHen.filter(item => {
        if (!item.ngayHen || !item.gioHen) return true;
        try {
          const apptTime = new Date(`${item.ngayHen}T${item.gioHen}`);
          return apptTime >= now;
        } catch (e) {
          return true;
        }
      })
    : filteredRawLichHen;

  const doctorsList = Array.isArray(doctorsData) ? doctorsData : [];

  const executeBooking = (payload: DatLichRequest) => {
    datLichMutation.mutate(payload, {
      onSuccess: () => {
        alert("🎯 Đặt lịch thành công!");
        queryClient.invalidateQueries({ queryKey: ["lich-hen"] });
        setIsDialogOpen(false);
        form.reset();
        setSelectedCustomer(null);
        setCustomerSearch("");
        setNewKhName("");
        setNewKhPhone("");
        setNewKhAddress("");
      },
      onError: (err) => {
        const axiosError = err as AxiosError<{message?: string}>;
        alert("Lỗi: " + (axiosError.response?.data?.message || "Không thể đặt lịch"));
      }
    });
  };

  const onSubmit: SubmitHandler<BookingFormValues> = (values) => {
    if (isAdmin) {
      alert("⚠️ Tài khoản Admin đang ở chế độ Chỉ đọc, không thể đặt lịch mới!");
      return;
    }

    if (bookingTab === "new") {
      if (!newKhName.trim() || !newKhPhone.trim()) {
        alert("Vui lòng điền Họ tên và Số điện thoại khách hàng mới!");
        return;
      }
      createKhachHangMutation.mutate(
        { hoTen: newKhName, sdt: newKhPhone, diaChi: newKhAddress || undefined },
        {
          onSuccess: (newKh) => {
            const payload: DatLichRequest = {
              maKh: newKh.maKh,
              maNs: values.maNs,
              maGoi: values.maGoi,
              ngayHen: values.ngayHen,
              gioHen: `${values.ngayHen}T${values.gioHen}:00`,
            };
            executeBooking(payload);
          },
          onError: (err: any) => {
            alert("Lỗi tạo khách hàng mới: " + (err.response?.data?.message || err.message));
          }
        }
      );
    } else {
      if (!selectedCustomer) {
        alert("Vui lòng chọn một khách hàng cũ từ danh sách!");
        return;
      }
      const payload: DatLichRequest = {
        maKh: selectedCustomer.maKh,
        maNs: values.maNs,
        maGoi: values.maGoi,
        ngayHen: values.ngayHen,
        gioHen: `${values.ngayHen}T${values.gioHen}:00`,
      };
      executeBooking(payload);
    }
  };

  const handleUpdateStatus = (maLh: string | number, status: string) => {
    if (isAdmin) {
      alert("⚠️ Tài khoản Admin đang ở chế độ Chỉ đọc, không thể cập nhật trạng thái!");
      return;
    }
    updateStatusMutation.mutate({ maLh, trangThai: status }, {
      onSuccess: () => {
        alert("✅ Đã cập nhật trạng thái!");
        queryClient.invalidateQueries({ queryKey: ["lich-hen"] });
      }
    });
  };

  const handleCheckIn = (maLh: string | number) => {
    if (isAdmin) {
      alert("⚠️ Tài khoản Admin đang ở chế độ Chỉ đọc, không thể thực hiện check-in!");
      return;
    }
    checkInMutation.mutate(maLh, {
      onSuccess: () => {
        alert("✅ Check-in thành công! Bệnh nhân đã được thêm vào hàng chờ.");
        queryClient.invalidateQueries({ queryKey: ["lich-hen"] });
      },
      onError: (err: any) => {
        alert("❌ Lỗi check-in: " + (err.response?.data?.message || err.message));
      }
    });
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Lịch hẹn</h1>
          <p className="text-sm text-slate-500">Tiếp nhận, duyệt lịch khám và điều phối khách hàng.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-5 h-11" disabled={isAdmin}>
              <Plus className="mr-2 h-5 w-5" /> Đặt lịch mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900">Tạo lịch hẹn mới</DialogTitle>
              <DialogDescription>
                Đăng ký khám cho khách hàng cũ hoặc thêm mới thông tin khách hàng trực tiếp.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={bookingTab} onValueChange={(val: any) => setBookingTab(val)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-xl p-1 mb-4">
                <TabsTrigger value="existing" className="rounded-lg font-semibold py-2">Khách hàng cũ</TabsTrigger>
                <TabsTrigger value="new" className="rounded-lg font-semibold py-2">Khách hàng mới</TabsTrigger>
              </TabsList>
              
              <TabsContent value="existing" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-400" /> Tìm kiếm khách hàng
                  </label>
                  <Input 
                    placeholder="Nhập tên hoặc số điện thoại..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                  {customerSearch && (
                    <div className="border border-slate-100 bg-slate-50 rounded-xl max-h-40 overflow-y-auto p-1 divide-y shadow-inner">
                      {customersList.length > 0 ? (
                        customersList.map((kh: any) => (
                          <div 
                            key={kh.maKh}
                            onClick={() => {
                              setSelectedCustomer({ maKh: kh.maKh, hoTen: kh.hoTen, sdt: kh.sdt });
                              setCustomerSearch("");
                            }}
                            className="p-2.5 hover:bg-blue-50 cursor-pointer rounded-lg text-xs flex justify-between items-center transition-colors"
                          >
                            <div>
                              <p className="font-bold text-slate-800">{kh.hoTen}</p>
                              <p className="text-slate-500 mt-0.5">{kh.sdt}</p>
                            </div>
                            <span className="font-mono text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded text-[10px]">{kh.maKh}</span>
                          </div>
                        ))
                      ) : (
                        <p className="p-3 text-xs text-slate-400 text-center">Không tìm thấy khách hàng nào</p>
                      )}
                    </div>
                  )}
                </div>

                {selectedCustomer && (
                  <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl flex justify-between items-center animate-in fade-in duration-300">
                    <div>
                      <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Đã chọn khách hàng</p>
                      <p className="text-sm font-extrabold text-slate-800 mt-1">{selectedCustomer.hoTen}</p>
                      <p className="text-xs text-slate-500 mt-0.5">SĐT: {selectedCustomer.sdt} | Mã: {selectedCustomer.maKh}</p>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setSelectedCustomer(null)}
                      className="text-slate-400 hover:text-red-500 rounded-full h-8 w-8 p-0"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="new" className="space-y-4">
                <div className="space-y-3.5 p-4 bg-slate-50 border rounded-xl">
                  <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase">
                    <Sparkles className="w-4 h-4 text-blue-500" /> Đăng ký hồ sơ nhanh
                  </h4>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Họ và tên khách hàng <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="Nguyễn Văn A..." 
                        value={newKhName}
                        onChange={(e) => setNewKhName(e.target.value)}
                        className="pl-9 h-10 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Số điện thoại <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="0912345678..." 
                        value={newKhPhone}
                        onChange={(e) => setNewKhPhone(e.target.value)}
                        className="pl-9 h-10 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Địa chỉ liên hệ</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="Quận 1, TP.HCM..." 
                        value={newKhAddress}
                        onChange={(e) => setNewKhAddress(e.target.value)}
                        className="pl-9 h-10 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4 pt-4 border-t">
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="maGoi" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Gói dịch vụ</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="rounded-xl"><SelectValue placeholder="Chọn gói khám" /></SelectTrigger></FormControl>
                        <SelectContent className="bg-white">
                          {arrGoiKham.map((goi) => (
                            <SelectItem key={goi.maDv} value={String(goi.maDv)}>{goi.tenDv}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="maNs" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Bác sĩ khám</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="rounded-xl"><SelectValue placeholder="Chọn bác sĩ" /></SelectTrigger></FormControl>
                        <SelectContent className="bg-white">
                          {doctorsList.map((doc: any) => (
                            <SelectItem key={doc.maNs} value={doc.maNs}>BS. {doc.hoTen}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="ngayHen" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Ngày khám</FormLabel>
                      <FormControl><Input type="date" {...field} className="rounded-xl h-10" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="gioHen" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Khung giờ trống</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDate}>
                        <FormControl><SelectTrigger className="rounded-xl"><SelectValue placeholder="Chọn giờ" /></SelectTrigger></FormControl>
                        <SelectContent className="bg-white">
                          {(slotsTrong as unknown as SlotTrongDTO[])?.map((slot, index) => (
                            <SelectItem key={index} value={formatSlotTime(slot.gioBatDau)}>{formatSlotTime(slot.gioBatDau)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 h-11 rounded-xl font-bold mt-4" 
                  disabled={datLichMutation.isPending || createKhachHangMutation.isPending}
                >
                  {(datLichMutation.isPending || createKhachHangMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                  Xác nhận đặt lịch hẹn
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* FILTER PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Tìm Tên hoặc SĐT..." 
            className="pl-9 rounded-xl" 
            value={searchKeyword} 
            onChange={(e) => setSearchKeyword(e.target.value)} 
          />
        </div>
        
        <div className="flex items-center gap-2">
          <CalendarIcon className="text-slate-400 w-4 h-4 shrink-0" />
          <Input 
            type="date" 
            className="text-sm rounded-xl" 
            value={filterDate} 
            onChange={(e) => setFilterDate(e.target.value)} 
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={filterDoctor} onValueChange={setFilterDoctor}>
            <SelectTrigger className="rounded-xl text-slate-600 bg-white">
              <SelectValue placeholder="Tất cả Bác sĩ" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="ALL_DOCTORS">Tất cả Bác sĩ</SelectItem>
              {doctorsList.map((doc: any) => (
                <SelectItem key={doc.maNs} value={doc.maNs}>BS. {doc.hoTen}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          variant="outline" 
          onClick={() => { setSearchKeyword(""); setFilterDate(""); setFilterDoctor(""); setHidePast(false); }}
          className="rounded-xl border-slate-200"
        >
          Làm mới bộ lọc
        </Button>

        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-200/60 transition-all">
          <input 
            type="checkbox" 
            checked={hidePast} 
            onChange={(e) => setHidePast(e.target.checked)} 
            className="rounded text-blue-600 focus:ring-blue-500 accent-blue-600 w-4 h-4"
          />
          <span>Ẩn lịch hẹn đã quá giờ</span>
        </label>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="pl-6">Thời gian</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Bác sĩ phụ trách</TableHead>
              <TableHead>Dịch vụ gói</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right pr-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingLich ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-blue-600" /></TableCell></TableRow>
            ) : arrLichHen.length > 0 ? (
              arrLichHen.map((item) => (
                <TableRow key={item.maLh} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell className="pl-6">
                    <div className="text-sm">
                      <p className="font-extrabold text-slate-800">{item.gioHen}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{item.ngayHen}</p>
                    </div>
                  </TableCell>
                  
                  <TableCell className="font-semibold text-slate-700">
                    <div>
                      <p className="font-bold text-slate-800">{item.tenKhachHang || item.maKh}</p>
                      {item.sdtKhachHang && <p className="text-xs text-slate-500 font-medium mt-0.5">{item.sdtKhachHang}</p>}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-sm font-semibold text-blue-600">
                    BS. {item.tenBacSi || "Chưa phân công"}
                  </TableCell>
                  
                  <TableCell className="text-sm font-medium text-slate-600">
                    {item.tenGoiKham || item.tenDv || "Khám thường"}
                  </TableCell>
                  
                  <TableCell><StatusBadge status={item.trangThai} /></TableCell>
                  
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      {(item.trangThai === "CHUA_XAC_NHAN" || item.trangThai === "CHO_XAC_NHAN") && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(item.maLh, "DA_XAC_NHAN")}
                          className="h-8 px-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg gap-1 transition-colors"
                          disabled={isAdmin}
                        >
                          <Check className="w-3.5 h-3.5" /> Duyệt
                        </Button>
                      )}

                      {item.trangThai === "DA_XAC_NHAN" && (
                        <Button
                          size="sm"
                          onClick={() => handleCheckIn(item.maLh)}
                          className="h-8 px-2.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg gap-1 transition-colors"
                          disabled={isAdmin}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Check-in
                        </Button>
                      )}
                      
                      {item.trangThai !== "DA_HUY" && item.trangThai !== "DA_DEN" && item.trangThai !== "DA_CHECK_IN" && item.trangThai !== "HOAN_THANH" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(item.maLh, "DA_HUY")}
                          className="h-8 px-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg gap-1 transition-colors"
                          disabled={isAdmin}
                        >
                          <X className="w-3.5 h-3.5" /> Hủy
                        </Button>
                      )}

                      {(item.trangThai === "DA_HUY" || item.trangThai === "DA_DEN" || item.trangThai === "DA_CHECK_IN" || item.trangThai === "HOAN_THANH") && (
                        <span className="text-xs text-slate-400 italic font-semibold">Không có thao tác</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-400">Không có dữ liệu lịch hẹn.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; icon: React.ReactNode; class: string }> = {
    "CHUA_XAC_NHAN": { label: "Chờ duyệt", icon: <Timer className="w-3 h-3 mr-1" />, class: "bg-amber-100 text-amber-700 border-amber-200" },
    "CHO_XAC_NHAN": { label: "Chờ duyệt", icon: <Timer className="w-3 h-3 mr-1" />, class: "bg-amber-100 text-amber-700 border-amber-200" },
    "DA_XAC_NHAN": { label: "Đã xác nhận", icon: <CheckCircle2 className="w-3 h-3 mr-1" />, class: "bg-blue-100 text-blue-700 border-blue-200" },
    "DA_DEN": { label: "Đã đến", icon: <CheckCircle2 className="w-3 h-3 mr-1" />, class: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "DA_HUY": { label: "Đã hủy", icon: <XCircle className="w-3 h-3 mr-1" />, class: "bg-red-100 text-red-700 border-red-200" },
  };
  const config = configs[status] || configs["CHUA_XAC_NHAN"];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${config.class}`}>
      {config.icon} {config.label}
    </span>
  );
}