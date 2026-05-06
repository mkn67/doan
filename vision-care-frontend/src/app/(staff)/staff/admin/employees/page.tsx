"use client"

import * as React from "react"
import { useState } from "react"
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Shield } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// Các UI component của Shadcn (Giữ nguyên của ông giáo)
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
// 1. ZOD SCHEMA: KHỚP 100% VỚI NhanSuRequestDTO BÊN JAVA
// ---------------------------------------------------------
const employeeSchema = z.object({
  username: z.string().min(4, { message: "Tên đăng nhập phải từ 4 ký tự" }),
  password: z.string().min(6, { message: "Mật khẩu tạm phải từ 6 ký tự" }),
  hoTen: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  sdt: z.string().min(10, { message: "Số điện thoại không hợp lệ" }),
  maNhom: z.string().min(1, { message: "Vui lòng chọn vai trò (Nhóm quyền)" }),
})

// Mock data tạm thời để test UI (Sau này ông giáo thay bằng data từ API GET)
const mockEmployees = [
  { id: "NV001", name: "Nguyễn Mai Kỳ", role: "Quản trị viên", status: "Hoạt động", email: "ky.nguyen@visioncare.com" },
]

// ---------------------------------------------------------
// 2. COMPONENT: DIALOG THÊM NHÂN VIÊN
// ---------------------------------------------------------
function AddEmployeeDialog() {
  const [open, setOpen] = useState(false)

  // CHÚ Ý: Mốt ông giáo import cái custom hook gọi API của ông giáo vào đây.
  // const createNhanSuMutation = useCreateNhanSu();

  const form = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      username: "",
      password: "Password123@", // Mật khẩu mặc định đủ mạnh
      hoTen: "",
      email: "",
      sdt: "",
      maNhom: "", 
    },
  })

  function onSubmit(values: z.infer<typeof employeeSchema>) {
    console.log("Dữ liệu chuẩn bị bắn lên API:", values)
    
    // GỌI API Ở ĐÂY:
    // createNhanSuMutation.mutate(values, {
    //   onSuccess: () => {
    //     setOpen(false);
    //     form.reset();
    //   }
    // });
    
    alert("Test: Dữ liệu đã chuẩn form Java, bật F12 console lên xem nhé!");
    setOpen(false)
    form.reset() 
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
            Hệ thống sẽ tự động tạo tài khoản đăng nhập và cấp quyền tương ứng. Mật khẩu mặc định là <span className="font-bold text-blue-600">Password123@</span>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 mt-4">
            
            {/* Cột 1: Thông tin đăng nhập */}
            <div className="space-y-4 col-span-2 md:col-span-1 border-r pr-4">
              <h3 className="text-sm font-semibold text-slate-500 mb-2">Thông tin tài khoản</h3>
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đăng nhập</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: ky.nguyen" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="maNhom" render={({ field }) => (
                <FormItem>
                  <FormLabel>Vai trò / Quyền hạn</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      {/* CÁC VALUE NÀY PHẢI KHỚP VỚI BẢNG "NHOM" TRONG DATABASE */}
                      <SelectItem value="NH04">Quản lý hệ thống</SelectItem>
                      <SelectItem value="NH01">Bác sĩ chuyên khoa</SelectItem>
                      <SelectItem value="NH06">Lễ tân</SelectItem>
                      <SelectItem value="NH02">Thu ngân</SelectItem>
                      <SelectItem value="NH03">Thủ kho</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Cột 2: Thông tin cá nhân */}
            <div className="space-y-4 col-span-2 md:col-span-1 pl-0 md:pl-4">
              <h3 className="text-sm font-semibold text-slate-500 mb-2">Thông tin hồ sơ</h3>
              <FormField control={form.control} name="hoTen" render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Nguyễn Mai Kỳ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="sdt" render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input placeholder="0987654321" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email nội bộ</FormLabel>
                  <FormControl>
                    <Input placeholder="ky.nguyen@visioncare.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Nút Submit */}
            <div className="col-span-2 flex justify-end gap-3 pt-4 border-t mt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Xác nhận lưu
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------
// 3. COMPONENT CHÍNH: TRANG QUẢN LÝ NHÂN VIÊN
// ---------------------------------------------------------
export default function EmployeesPage() {
  return (
    <div className="p-6 space-y-6 flex-1">
      {/* HEADER (Giữ nguyên của ông giáo) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý nhân sự</h1>
          <p className="text-sm text-slate-500">
            Xem danh sách, thêm mới và quản lý thông tin nhân viên trong hệ thống.
          </p>
        </div>
        <AddEmployeeDialog />
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input type="text" placeholder="Tìm theo tên hoặc mã NV..." className="pl-9 bg-white" />
        </div>
      </div>

      <div className="bg-white rounded-md border shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px] font-semibold">Mã NV</TableHead>
              <TableHead className="font-semibold">Họ và tên</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Vai trò</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="text-right font-semibold">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockEmployees.map((emp) => (
              <TableRow key={emp.id} className="hover:bg-slate-50">
                <TableCell className="font-medium text-blue-600">{emp.id}</TableCell>
                <TableCell>{emp.name}</TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Shield className="mr-1 w-3 h-3" /> {emp.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    emp.status === 'Hoạt động' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {emp.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4 text-blue-500" /> Sửa thông tin
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Xóa nhân viên
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}