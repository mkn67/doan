"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { 
  Search, Plus, UserCircle, Phone, Loader2, ShieldAlert, Eye, Edit, Mail, MapPin, Calendar
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Import Hook và Type DTO từ file hook của bạn
import { useDanhSachKhachHang, useCreateKhachHang, useUpdateKhachHang } from "@/hooks/useCustomer"; 

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

// =========================================================
// 1. ĐỊNH NGHĨA INTERFACE (Cập nhật để khớp với DTO)
// =========================================================
interface Customer {
  maKh: string | number;
  hoTen: string;
  sdt: string;
  cccd?: string;
  gioiTinh?: string;
  ngaySinh?: string;
  diaChi?: string;
  diemTichLuy?: number;
  email?: string;
  ghiChu?: string;
  ngayTao?: string;
  tongSoLanKham?: number;
  tongChiTieu?: number;
  lichHenGanNhat?: string;
}

const customerSchema = z.object({
  hoTen: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  sdt: z.string().regex(/^(0[3|5|7|8|9])[0-9]{8}$/, "SĐT phải bắt đầu bằng 0 và đủ 10 số"),
  cccd: z.string().optional().or(z.literal("")),
  gioiTinh: z.string().min(1, "Vui lòng chọn giới tính"),
  ngaySinh: z.string().optional().or(z.literal("")),
  diaChi: z.string().optional().or(z.literal("")),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  ghiChu: z.string().optional().or(z.literal("")),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function CustomersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDetailCustomer, setSelectedDetailCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const ALLOWED_ROLES = ["ROLE_LE_TAN", "NH06", "ROLE_ADMIN", "NH04"];

  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
    }, 0);
  }, []);

  // 2. GỌI HOOK API
  const { data: listCustomers, isLoading } = useDanhSachKhachHang();
  const createCustomerMutation = useCreateKhachHang();
  const updateCustomerMutation = useUpdateKhachHang();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      hoTen: "", sdt: "", cccd: "", gioiTinh: "", ngaySinh: "", diaChi: "", email: "", ghiChu: "",
    },
  });

  const editForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      hoTen: "", sdt: "", cccd: "", gioiTinh: "", ngaySinh: "", diaChi: "", email: "", ghiChu: "",
    },
  });

  useEffect(() => {
    if (selectedDetailCustomer) {
      editForm.reset({
        hoTen: selectedDetailCustomer.hoTen || "",
        sdt: selectedDetailCustomer.sdt || "",
        cccd: selectedDetailCustomer.cccd || "",
        gioiTinh: selectedDetailCustomer.gioiTinh || "",
        ngaySinh: selectedDetailCustomer.ngaySinh || "",
        diaChi: selectedDetailCustomer.diaChi || "",
        email: selectedDetailCustomer.email || "",
        ghiChu: selectedDetailCustomer.ghiChu || "",
      });
    }
  }, [selectedDetailCustomer, editForm]);

  const hasAccess = () => {
    if (!user) return false;
    const userRoles = user?.roles || [];
    const userGroup = user?.maNhom ? user.maNhom : null;
    return ALLOWED_ROLES.some(role => userRoles.includes(role) || role === userGroup);
  };

  if (!isMounted || loading) {
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
        <p className="text-slate-500 mt-2 max-w-md text-center">
          Tài khoản <b>{user?.username}</b> không có nghiệp vụ Lễ tân.
        </p>
        <Button onClick={() => router.back()} className="mt-6 bg-slate-800 hover:bg-slate-900">
          Quay lại trang trước
        </Button>
      </div>
    );
  }

  const isAdmin = user?.roles?.includes("ROLE_ADMIN") || user?.maNhom === "NH04";

  // Chuyển đổi dữ liệu từ DTO sang kiểu Customer local một cách an toàn
  // "as unknown as Customer[]" giúp vượt qua kiểm tra nghiêm ngặt của TS khi DTO thiếu trường
  const customers = (listCustomers as unknown as Customer[]) || [];

  const filteredCustomers = customers.filter((c) => 
    c.hoTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.sdt?.includes(searchTerm)
  );

  function onSubmit(values: CustomerFormValues) {
    if (isAdmin) {
      alert("⚠️ Tài khoản Admin đang ở chế độ Chỉ đọc, không thể thêm khách hàng!");
      return;
    }
    createCustomerMutation.mutate(values as Parameters<typeof createCustomerMutation.mutate>[0], {
      onSuccess: () => {
        alert("Thêm khách hàng thành công!");
        form.reset();
        setIsDialogOpen(false);
      }
    });
  }

  function onEditSubmit(values: CustomerFormValues) {
    if (isAdmin) {
      alert("⚠️ Tài khoản Admin đang ở chế độ Chỉ đọc, không thể chỉnh sửa khách hàng!");
      return;
    }
    if (!selectedDetailCustomer) return;

    updateCustomerMutation.mutate({
      maKh: String(selectedDetailCustomer.maKh),
      data: values
    }, {
      onSuccess: (updatedData) => {
        alert("Cập nhật thông tin khách hàng thành công!");
        setIsEditing(false);
        setSelectedDetailCustomer(updatedData as unknown as Customer);
      },
      onError: (err: any) => {
        alert("Lỗi cập nhật: " + (err.response?.data?.message || err.message));
      }
    });
  }

  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Khách hàng</h1>
          <p className="text-sm text-slate-500">Tra cứu thông tin, tạo hồ sơ và theo dõi điểm tích lũy.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md" disabled={isAdmin}>
              <Plus className="mr-2 h-4 w-4" /> Thêm khách hàng mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-white">
            <DialogHeader>
              <DialogTitle>Tạo hồ sơ khách hàng</DialogTitle>
              <DialogDescription>Hệ thống sẽ tự động tạo tài khoản đăng nhập cho khách.</DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="hoTen" render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel>Họ và tên <span className="text-red-500">*</span></FormLabel>
                      <FormControl><Input placeholder="VD: Nguyễn Văn A" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="sdt" render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel>Số điện thoại <span className="text-red-500">*</span></FormLabel>
                      <FormControl><Input placeholder="0987654321" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="cccd" render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel>Số CCCD</FormLabel>
                      <FormControl><Input placeholder="Gồm 12 chữ số" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="gioiTinh" render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel>Giới tính <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Chọn giới tính" /></SelectTrigger></FormControl>
                        <SelectContent className="bg-white">
                          <SelectItem value="Nam">Nam</SelectItem>
                          <SelectItem value="Nữ">Nữ</SelectItem>
                          <SelectItem value="Khác">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ngaySinh" render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel>Ngày sinh</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="VD: customer@gmail.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="diaChi" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Địa chỉ</FormLabel>
                      <FormControl><Input placeholder="Số nhà, Tên đường, Quận/Huyện..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ghiChu" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Ghi chú</FormLabel>
                      <FormControl><Input placeholder="Tình trạng đặc biệt, yêu cầu riêng..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={createCustomerMutation.isPending}>
                    {createCustomerMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Lưu thông tin
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* THANH TÌM KIẾM */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            type="text" 
            placeholder="Tìm theo Tên hoặc Số điện thoại..." 
            className="pl-9 bg-slate-50 border-slate-200" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-600">Thông tin Khách hàng</TableHead>
                <TableHead className="font-semibold text-slate-600">Giới tính</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right">Mã KH</TableHead>
                <TableHead className="font-semibold text-slate-600 text-center w-36">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10">Đang tải dữ liệu...</TableCell></TableRow>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.maKh} className="hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {customer.hoTen?.charAt(0) || <UserCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{customer.hoTen}</p>
                          <div className="flex items-center text-xs text-slate-500 mt-0.5">
                            <Phone className="w-3 h-3 mr-1" /> {customer.sdt}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{customer.gioiTinh || "Chưa cập nhật"}</TableCell>
                    <TableCell className="text-right font-mono text-slate-500 text-sm">
                      {customer.maKh}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDetailCustomer(customer)}
                        className="h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 gap-1 rounded-lg font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem chi tiết</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                    Không tìm thấy khách hàng nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* DIALOG CHI TIẾT VÀ CHỈNH SỬA KHÁCH HÀNG */}
      <Dialog open={!!selectedDetailCustomer} onOpenChange={(open) => {
        if (!open) {
          setSelectedDetailCustomer(null);
          setIsEditing(false);
        }
      }}>
        <DialogContent className="sm:max-w-[650px] bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <UserCircle className="w-6 h-6 text-blue-600" />
              {isEditing ? "Chỉnh sửa thông tin khách hàng" : "Thông tin chi tiết khách hàng"}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Cập nhật thông tin hồ sơ của khách hàng trong hệ thống."
                : "Xem hồ sơ thông tin đầy đủ, lịch sử hoạt động và ghi chú."}
            </DialogDescription>
          </DialogHeader>

          {selectedDetailCustomer && (
            <div className="mt-4 space-y-5">
              {!isEditing ? (
                // View Mode
                <div className="space-y-6">
                  {/* Grid 1: Basic info */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="col-span-2 md:col-span-1 space-y-1">
                      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Họ và tên</span>
                      <p className="text-slate-800 font-extrabold text-base">{selectedDetailCustomer.hoTen}</p>
                    </div>
                    <div className="col-span-2 md:col-span-1 space-y-1">
                      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Mã Khách Hàng</span>
                      <p className="text-slate-800 font-mono font-bold text-sm bg-slate-200/60 px-2 py-0.5 rounded w-fit">{selectedDetailCustomer.maKh}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Số điện thoại</span>
                      <p className="text-slate-800 font-bold flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-500" /> {selectedDetailCustomer.sdt}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Giới tính</span>
                      <p className="text-slate-800 font-semibold">{selectedDetailCustomer.gioiTinh || "Chưa cập nhật"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Ngày sinh</span>
                      <p className="text-slate-800 font-semibold">
                        {selectedDetailCustomer.ngaySinh 
                          ? new Date(selectedDetailCustomer.ngaySinh).toLocaleDateString("vi-VN") 
                          : "Chưa cập nhật"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Số CCCD</span>
                      <p className="text-slate-800 font-semibold">{selectedDetailCustomer.cccd || "Chưa cập nhật"}</p>
                    </div>
                  </div>

                  {/* Grid 2: Contact */}
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b pb-1">Thông tin liên hệ & Ghi chú</h4>
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                      <div className="col-span-2 space-y-1">
                        <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Email</span>
                        <p className="text-slate-800 font-medium flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-500" /> {selectedDetailCustomer.email || "Chưa cập nhật"}</p>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Địa chỉ</span>
                        <p className="text-slate-800 font-medium flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {selectedDetailCustomer.diaChi || "Chưa cập nhật"}</p>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Ghi chú</span>
                        <p className="text-slate-700 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">{selectedDetailCustomer.ghiChu || "Không có ghi chú đặc biệt."}</p>
                      </div>
                    </div>
                  </div>

                  {/* Grid 3: Stats */}
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b pb-1">Thống kê hoạt động</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-xl">
                        <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider block">Tổng số lần khám</span>
                        <span className="text-blue-700 text-lg font-black">{selectedDetailCustomer.tongSoLanKham ?? 0}</span>
                      </div>
                      <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl">
                        <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider block">Tổng chi tiêu</span>
                        <span className="text-emerald-700 text-base font-black">{(selectedDetailCustomer.tongChiTieu ?? 0).toLocaleString("vi-VN")}₫</span>
                      </div>
                      <div className="p-3 bg-purple-50/40 border border-purple-100 rounded-xl">
                        <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider block">Lịch hẹn gần nhất</span>
                        <span className="text-purple-700 text-[11px] font-bold block truncate mt-1">
                          {selectedDetailCustomer.lichHenGanNhat 
                            ? new Date(selectedDetailCustomer.lichHenGanNhat).toLocaleDateString("vi-VN") 
                            : "Không có"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-[10px] text-slate-400 font-medium">Hồ sơ lập ngày: {selectedDetailCustomer.ngayTao ? new Date(selectedDetailCustomer.ngayTao).toLocaleDateString("vi-VN") : "N/A"}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setSelectedDetailCustomer(null)}>Đóng</Button>
                      <Button 
                        onClick={() => setIsEditing(true)} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                        disabled={isAdmin}
                      >
                        <Edit className="w-4 h-4 mr-1.5" /> Chỉnh sửa hồ sơ
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={editForm.control} name="hoTen" render={({ field }) => (
                        <FormItem className="col-span-2 md:col-span-1">
                          <FormLabel>Họ và tên <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input placeholder="VD: Nguyễn Văn A" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={editForm.control} name="sdt" render={({ field }) => (
                        <FormItem className="col-span-2 md:col-span-1">
                          <FormLabel>Số điện thoại <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input placeholder="0987654321" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={editForm.control} name="cccd" render={({ field }) => (
                        <FormItem className="col-span-2 md:col-span-1">
                          <FormLabel>Số CCCD</FormLabel>
                          <FormControl><Input placeholder="Gồm 12 chữ số" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={editForm.control} name="gioiTinh" render={({ field }) => (
                        <FormItem className="col-span-2 md:col-span-1">
                          <FormLabel>Giới tính <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Chọn giới tính" /></SelectTrigger></FormControl>
                            <SelectContent className="bg-white">
                              <SelectItem value="Nam">Nam</SelectItem>
                              <SelectItem value="Nữ">Nữ</SelectItem>
                              <SelectItem value="Khác">Khác</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={editForm.control} name="ngaySinh" render={({ field }) => (
                        <FormItem className="col-span-2 md:col-span-1">
                          <FormLabel>Ngày sinh</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={editForm.control} name="email" render={({ field }) => (
                        <FormItem className="col-span-2 md:col-span-1">
                          <FormLabel>Email</FormLabel>
                          <FormControl><Input type="email" placeholder="VD: customer@gmail.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={editForm.control} name="diaChi" render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Địa chỉ</FormLabel>
                          <FormControl><Input placeholder="Số nhà, Tên đường, Quận/Huyện..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={editForm.control} name="ghiChu" render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Ghi chú</FormLabel>
                          <FormControl><Input placeholder="Ghi chú về khách hàng..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Hủy bỏ</Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={updateCustomerMutation.isPending}>
                        {updateCustomerMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Lưu thay đổi
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}