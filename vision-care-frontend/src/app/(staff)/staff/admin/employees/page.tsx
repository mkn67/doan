"use client"

import * as React from "react"
import { useState } from "react"
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Shield, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
// IMPORT THÊM useDanhSachNhanSu
import { useCreateNhanSu, useDanhSachNhanSu } from "@/hooks/useStaff"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

// ---------------------------------------------------------
// 1. INTERFACE CHO DỮ LIỆU NHÂN SỰ (KHỚP VỚI JAVA)
// ---------------------------------------------------------
interface PageResponseDTO<T> {
  content?: T[];
  data?: T[];
}

interface NhanSu {
  maNs: string;
  hoTen: string;
  email: string;
  sdt: string;
  tenNhom?: string; // Tên vai trò
  trangThai?: string;
}

const employeeSchema = z.object({
  username: z.string().min(4, { message: "Tên đăng nhập phải từ 4 ký tự" }),
  password: z.string().min(6, { message: "Mật khẩu tạm phải từ 6 ký tự" }),
  hoTen: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  sdt: z.string().min(10, { message: "Số điện thoại không hợp lệ" }),
  maNhom: z.string().min(1, { message: "Vui lòng chọn vai trò (Nhóm quyền)" }),
})

function AddEmployeeDialog() {
  const [open, setOpen] = useState(false)
  const createNhanSuMutation = useCreateNhanSu();

  const form = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      username: "",
      password: "Password123@",
      hoTen: "",
      email: "",
      sdt: "",
      maNhom: "", 
    },
  })

  function onSubmit(values: z.infer<typeof employeeSchema>) {
    createNhanSuMutation.mutate(values, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Thêm nhân viên
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Thêm nhân sự mới</DialogTitle>
          <DialogDescription>
            Hệ thống sẽ tự động tạo tài khoản đăng nhập cho nhân viên.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-4 col-span-2 md:col-span-1 border-r pr-4">
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đăng nhập</FormLabel>
                  <FormControl><Input placeholder="ky.nguyen" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="maNhom" render={({ field }) => (
                <FormItem>
                  <FormLabel>Vai trò</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Chọn vai trò" /></SelectTrigger></FormControl>
                    <SelectContent className="bg-white">
                      <SelectItem value="NH04">Quản lý hệ thống</SelectItem>
                      <SelectItem value="NH01">Bác sĩ chuyên khoa</SelectItem>
                      <SelectItem value="NH06">Lễ tân</SelectItem>
                      <SelectItem value="NH02">Thu ngân</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="space-y-4 col-span-2 md:col-span-1 pl-0 md:pl-4">
              <FormField control={form.control} name="hoTen" render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl><Input placeholder="Nguyễn Văn A" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="sdt" render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl><Input placeholder="09..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input placeholder="a@gmail.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="col-span-2 flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
              <Button type="submit" className="bg-blue-600" disabled={createNhanSuMutation.isPending}>
                {createNhanSuMutation.isPending ? <Loader2 className="animate-spin" /> : "Xác nhận"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // ---------------------------------------------------------
  // 2. GỌI API LẤY DANH SÁCH THẬT
  // ---------------------------------------------------------
  const { data, isLoading } = useDanhSachNhanSu(0, 50, searchTerm);

  // Xử lý dữ liệu từ PageResponseDTO một cách an toàn không dùng any
  const employees: NhanSu[] = 
    (data as PageResponseDTO<NhanSu>)?.content || 
    (data as PageResponseDTO<NhanSu>)?.data || 
    (Array.isArray(data) ? data : []);

  return (
    <div className="p-6 space-y-6 flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý nhân sự</h1>
          <p className="text-sm text-slate-500">Xem danh sách nhân viên thực tế trong Database.</p>
        </div>
        <AddEmployeeDialog />
      </div>

      <div className="relative w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        <Input 
          type="text" 
          placeholder="Tìm theo tên..." 
          className="pl-9 bg-white" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-md border shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold">Mã NV</TableHead>
              <TableHead className="font-semibold">Họ và tên</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Vai trò</TableHead>
              <TableHead className="text-right font-semibold">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <Loader2 className="animate-spin mx-auto text-blue-600" />
                  <p className="text-sm text-slate-500 mt-2">Đang tải dữ liệu từ Java...</p>
                </TableCell>
              </TableRow>
            ) : employees.length > 0 ? (
              employees.map((emp: NhanSu) => (
                <TableRow key={emp.maNs} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-blue-600">{emp.maNs}</TableCell>
                  <TableCell>{emp.hoTen}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Shield className="mr-1 w-3 h-3" /> {emp.tenNhom || "Chưa phân nhóm"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Sửa</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Xóa</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-slate-400">
                  Không tìm thấy nhân viên nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}