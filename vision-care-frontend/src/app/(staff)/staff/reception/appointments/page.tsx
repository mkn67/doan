"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, Plus, Search, 
  MoreHorizontal, CheckCircle2, XCircle, Timer, Loader2,
  Check, X
} from "lucide-react";
import { useForm, SubmitHandler, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation"; // 1. IMPORT useRouter

import { useDatLich, useDanhSachDichVu } from "@/hooks/useClinic"; 
import { useDanhSachLichHen, useSlotTrong, useUpdateTrangThaiLichHen } from "@/hooks/useStaff"; 
import { LichHenFilterDTO, SlotTrongDTO, LichHenResponseDTO } from "@/types/staff";
import { DatLichRequest, DichVuKhamResponse } from "@/types/clinic";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  tenGoiKham?: string;
  tenDv?: string;
};

const bookingSchema = z.object({
  maKh: z.string().min(1, "Vui lòng nhập mã khách hàng"),
  maGoi: z.string().min(1, "Vui lòng chọn gói khám"),
  maNs: z.string().min(1, "Vui lòng chọn bác sĩ"),
  ngayHen: z.string().min(1, "Vui lòng chọn ngày"),
  gioHen: z.string().min(1, "Vui lòng chọn giờ"),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function AppointmentsPage() {
  const queryClient = useQueryClient();
  const router = useRouter(); // 2. KHỞI TẠO router ĐỂ HẾT LỖI 'Cannot find name router'
  const [isMounted, setIsMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const filters: LichHenFilterDTO = {
    keyword: searchKeyword || undefined,
    tuNgay: filterDate || undefined,
    denNgay: filterDate || undefined,
    page: 0,
    size: 50
  };

  const { data: listLichHen, isLoading: loadingLich } = useDanhSachLichHen(filters);
  const { data: listGoiKham } = useDanhSachDichVu();
  const datLichMutation = useDatLich();
  const updateStatusMutation = useUpdateTrangThaiLichHen();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { maKh: "", maGoi: "", maNs: "", ngayHen: "", gioHen: "" }
  });

  const selectedDate = useWatch({ control: form.control, name: "ngayHen" });
  const { data: slotsTrong } = useSlotTrong(selectedDate);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const arrGoiKham: DichVuKhamResponse[] = 
    (listGoiKham as PageResponseDTO<DichVuKhamResponse>)?.content || 
    (listGoiKham as PageResponseDTO<DichVuKhamResponse>)?.data || 
    (Array.isArray(listGoiKham) ? listGoiKham : []);

  const arrLichHen: UI_LichHen[] = 
    (listLichHen as PageResponseDTO<UI_LichHen>)?.content || 
    (listLichHen as PageResponseDTO<UI_LichHen>)?.data || 
    (Array.isArray(listLichHen) ? listLichHen : []);

  if (!isMounted) return null;

  const onSubmit: SubmitHandler<BookingFormValues> = (values) => {
    const payload: DatLichRequest = {
      maKh: values.maKh, maNs: values.maNs, maGoi: values.maGoi,
      ngayHen: values.ngayHen, gioHen: `${values.ngayHen}T${values.gioHen}:00`,
    };
    datLichMutation.mutate(payload, {
      onSuccess: () => {
        alert("🎯 Đặt lịch thành công!");
        queryClient.invalidateQueries({ queryKey: ["lich-hen"] });
        setIsDialogOpen(false);
        form.reset();
      },
      onError: (err) => {
        const axiosError = err as AxiosError<{message?: string}>;
        alert("Lỗi: " + (axiosError.response?.data?.message || "Không thể đặt lịch"));
      }
    });
  };

  const handleUpdateStatus = (maLh: string | number, status: string) => {
    updateStatusMutation.mutate({ maLh, trangThai: status }, {
      onSuccess: () => {
        alert("✅ Đã cập nhật trạng thái!");
        queryClient.invalidateQueries({ queryKey: ["lich-hen"] });
      }
    });
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Lịch hẹn</h1>
          <p className="text-sm text-slate-500">Tiếp nhận và duyệt lịch khám bệnh.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Đặt lịch mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white">
            {/* 3. SỬ DỤNG DialogHeader, Title, Description ĐỂ HẾT LỖI LINT */}
            <DialogHeader>
              <DialogTitle>Tạo lịch hẹn mới</DialogTitle>
              <DialogDescription>
                Nhập mã khách hàng và chọn khung giờ bác sĩ còn trống.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="maKh" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã khách hàng</FormLabel>
                    <FormControl><Input placeholder="KH..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="maGoi" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gói khám</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Chọn gói" /></SelectTrigger></FormControl>
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
                      <FormLabel>Bác sĩ</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Chọn BS" /></SelectTrigger></FormControl>
                        <SelectContent className="bg-white">
                          <SelectItem value="NS001">BS. Đặng Thu Diễm</SelectItem>
                          <SelectItem value="NS002">BS. Lê Văn Luyện</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="ngayHen" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày hẹn</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="gioHen" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giờ khám</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDate}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Chọn giờ" /></SelectTrigger></FormControl>
                        <SelectContent className="bg-white">
                          {(slotsTrong as unknown as SlotTrongDTO[])?.map((slot, index) => (
                            <SelectItem key={index} value={String(slot.gioBatDau)}>{slot.gioBatDau}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <Button type="submit" className="w-full bg-blue-600" disabled={datLichMutation.isPending}>
                  {datLichMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Xác nhận đặt lịch
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Tìm Tên hoặc SĐT..." className="pl-9" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="text-slate-400 w-4 h-4" />
          <Input type="date" className="text-sm" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        </div>
        <Button variant="outline" onClick={() => { setSearchKeyword(""); setFilterDate(""); }}>Làm mới bộ lọc</Button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Dịch vụ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingLich ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
            ) : arrLichHen.length > 0 ? (
              arrLichHen.map((item) => (
                <TableRow key={item.maLh}>
                  <TableCell>
                    <div className="text-sm"><p className="font-bold">{item.gioHen}</p><p className="text-slate-500">{item.ngayHen}</p></div>
                  </TableCell>
                  <TableCell className="font-medium">{item.tenKhachHang || item.maKh}</TableCell>
                  <TableCell className="text-sm">{item.tenGoiKham || item.tenDv}</TableCell>
                  <TableCell><StatusBadge status={item.trangThai} /></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={updateStatusMutation.isPending}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {item.trangThai === "CHUA_XAC_NHAN" && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(item.maLh, "DA_XAC_NHAN")} className="text-emerald-600">
                            <Check className="mr-2 h-4 w-4" /> Xác nhận lịch
                          </DropdownMenuItem>
                        )}
                        
                        {item.trangThai !== "DA_HUY" && item.trangThai !== "DA_DEN" && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(item.maLh, "DA_HUY")} className="text-red-600">
                            <X className="mr-2 h-4 w-4" /> Hủy lịch hẹn
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem onClick={() => router.push(`/staff/clinic/examinations?makh=${item.maKh}`)}>
                           Ghi hồ sơ khám
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400">Không có dữ liệu.</TableCell></TableRow>
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