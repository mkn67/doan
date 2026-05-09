"use client";

import * as React from "react";
import { useState } from "react";
import { 
  Search, Plus, UserCircle, Phone, Award, Loader2 
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Import Hook và Type DTO từ file hook của bạn
import { useDanhSachKhachHang, useCreateKhachHang } from "@/hooks/useCustomer"; 

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
  gioiTinh?: string; // Để dấu ? vì DTO có thể không có hoặc tên khác
  ngaySinh?: string;
  diaChi?: string;
  diemTichLuy?: number;
}

const customerSchema = z.object({
  hoTen: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  sdt: z.string().regex(/^(0[3|5|7|8|9])[0-9]{8}$/, "SĐT phải bắt đầu bằng 0 và đủ 10 số"),
  cccd: z.string().optional(),
  gioiTinh: z.string().min(1, "Vui lòng chọn giới tính"),
  ngaySinh: z.string().optional(),
  diaChi: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 2. GỌI HOOK API
  const { data: listCustomers, isLoading } = useDanhSachKhachHang();
  const createCustomerMutation = useCreateKhachHang();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      hoTen: "", sdt: "", cccd: "", gioiTinh: "", ngaySinh: "", diaChi: "",
    },
  });

  // Chuyển đổi dữ liệu từ DTO sang kiểu Customer local một cách an toàn
  // "as unknown as Customer[]" giúp vượt qua kiểm tra nghiêm ngặt của TS khi DTO thiếu trường
  const customers = (listCustomers as unknown as Customer[]) || [];

  const filteredCustomers = customers.filter((c) => 
    c.hoTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.sdt?.includes(searchTerm)
  );

  function onSubmit(values: CustomerFormValues) {
    createCustomerMutation.mutate(values as Parameters<typeof createCustomerMutation.mutate>[0], {
      onSuccess: () => {
        alert("🎉 Thêm khách hàng thành công!");
        form.reset();
        setIsDialogOpen(false);
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
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
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
                <TableHead className="font-semibold text-slate-600">Điểm tích lũy</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Mã KH</TableHead>
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
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
                        <Award className="w-3 h-3 mr-1" /> {customer.diemTichLuy || 0} điểm
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-mono text-slate-500">{customer.maKh}</span>
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
    </div>
  );
}