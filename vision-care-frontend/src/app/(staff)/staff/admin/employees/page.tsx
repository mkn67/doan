"use client"

import * as React from "react"
import { useState } from "react"
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Shield } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// Các UI component của Shadcn
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// IMPORT THÊM CHO PHẦN DIALOG VÀ FORM
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ---------------------------------------------------------
// 1. DỮ LIỆU GIẢ LẬP & LUẬT KIỂM TRA FORM (ZOD)
// ---------------------------------------------------------

const mockEmployees = [
  { id: "NV001", name: "Nguyễn Mai Kỳ", role: "Quản trị viên", status: "Hoạt động", email: "ky.nguyen@visioncare.com" },
  { id: "NV002", name: "Trần Hải Anh", role: "Lễ tân", status: "Hoạt động", email: "haianh.tran@visioncare.com" },
  { id: "BS001", name: "Lê Văn Luyện", role: "Bác sĩ", status: "Nghỉ phép", email: "bs.luyen@visioncare.com" },
]

const employeeSchema = z.object({
  fullName: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  role: z.string().min(1, { message: "Vui lòng chọn vai trò" }),
  password: z.string().min(6, { message: "Mật khẩu tạm phải từ 6 ký tự" }),
})

// ---------------------------------------------------------
// 2. COMPONENT: DIALOG THÊM NHÂN VIÊN
// ---------------------------------------------------------

function AddEmployeeDialog() {
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      fullName: "",
      email: "",
      role: "",
      password: "password123", 
    },
  })

  function onSubmit(values: z.infer<typeof employeeSchema>) {
    console.log("Dữ liệu gửi lên API:", values)
    alert("Thêm thành công: " + values.fullName)
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
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Thêm nhân sự mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để cấp tài khoản. Mật khẩu mặc định là <span className="font-bold text-blue-600">password123</span>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Trần Văn A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email nội bộ</FormLabel>
                  <FormControl>
                    <Input placeholder="a.tran@visioncare.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vai trò / Vị trí</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vị trí công tác" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      <SelectItem value="DOCTOR">Bác sĩ chuyên khoa</SelectItem>
                      <SelectItem value="RECEPTIONIST">Lễ tân</SelectItem>
                      <SelectItem value="CASHIER">Thu ngân</SelectItem>
                      <SelectItem value="TECHNICIAN">Kỹ thuật viên phòng kính</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Xác nhận thêm
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
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý nhân sự</h1>
          <p className="text-sm text-slate-500">
            Xem danh sách, thêm mới và quản lý thông tin nhân viên trong hệ thống.
          </p>
        </div>
        <AddEmployeeDialog />
      </div>

      {/* TOOLBAR */}
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            type="text" 
            placeholder="Tìm theo tên hoặc mã NV..." 
            className="pl-9 bg-white"
          />
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
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
                        <span className="sr-only">Mở menu</span>
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