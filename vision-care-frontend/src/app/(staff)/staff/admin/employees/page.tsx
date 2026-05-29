"use client"

import * as React from "react"
import { useState } from "react"
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Shield, Loader2, AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  useCreateNhanSu, 
  useDanhSachNhanSu, 
  useUpdateNhanSu, 
  useDeleteNhanSu,
  useDanhSachChucVu,
  useDanhSachNhomQuyen
} from "@/hooks/useStaff"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { NhanSuRequestDTO, NhanSuResponseDTO, PageResponseDTO } from "@/types/staff"

// ---------------------------------------------------------
// SCHEMA
// ---------------------------------------------------------
const employeeSchema = z.object({
  username: z.string().min(4, { message: "Tên đăng nhập phải từ 4 ký tự" }),
  password: z.string().min(6, { message: "Mật khẩu tạm phải từ 6 ký tự" }),
  hoTen: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  email: z.string().email({ message: "Email không hợp lệ" }).optional().or(z.literal("")),
  sdt: z.string().min(10, { message: "Số điện thoại không hợp lệ" }),
  maNhom: z.string().min(1, { message: "Vui lòng chọn nhóm quyền" }),
  maChucVu: z.string().min(1, { message: "Vui lòng chọn chức vụ" }),
})

// Mapping between Nhóm Quyền (maNhom) and Chức Vụ (maChucVu) to synchronize them
const nhomToChucVuMap: Record<string, string> = {
  "BAC_SI": "CV06",   // Bác sĩ
  "KY_THUAT": "CV07", // Kỹ thuật viên mắt kính
  "THU_NGAN": "CV08", // Thu ngân
  "THU_KHO": "CV09",  // Thủ kho
  "ADMIN": "CV10",    // Quản lý
  "LE_TAN": "CV11",   // Lễ tân
};

const chucVuToNhomMap: Record<string, string> = {
  "CV06": "BAC_SI",
  "CV07": "KY_THUAT",
  "CV08": "THU_NGAN",
  "CV09": "THU_KHO",
  "CV10": "ADMIN",
  "CV11": "LE_TAN",
};

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editEmployee, setEditEmployee] = useState<NhanSuResponseDTO | null>(null);
  const [deleteEmployee, setDeleteEmployee] = useState<NhanSuResponseDTO | null>(null);
  
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data, isLoading } = useDanhSachNhanSu(0, 50, searchTerm);
  const { data: listChucVu } = useDanhSachChucVu();
  const { data: listNhomQuyen } = useDanhSachNhomQuyen();
  
  const createMutation = useCreateNhanSu();
  const updateMutation = useUpdateNhanSu();
  const deleteMutation = useDeleteNhanSu();

  const employees: NhanSuResponseDTO[] = 
    (data as PageResponseDTO<NhanSuResponseDTO>)?.content || 
    (Array.isArray(data) ? data : []);

  const form = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      username: "", password: "Password123@", hoTen: "", email: "", sdt: "", maNhom: "", maChucVu: ""
    },
  })

  // Open Edit Modal
  const openEdit = (emp: NhanSuResponseDTO) => {
    setEditEmployee(emp);
    form.reset({
      username: emp.taiKhoan?.username || "none",
      password: "Password123@", // Dummy password for edit form logic
      hoTen: emp.hoTen || "",
      email: emp.email || "",
      sdt: emp.sdt || "",
      maNhom: emp.taiKhoan?.loaiTk || "", 
      maChucVu: listChucVu?.find(c => c.tenCv === emp.tenChucVu)?.maCv || "" 
    });
  }

  // Close Modals
  const closeModals = () => {
    setEditEmployee(null);
    setIsAddOpen(false);
    form.reset({ username: "", password: "Password123@", hoTen: "", email: "", sdt: "", maNhom: "", maChucVu: "" });
  }

  const onSubmit = (values: z.infer<typeof employeeSchema>) => {
    if (editEmployee) {
      updateMutation.mutate({ maNs: editEmployee.maNs, data: values as NhanSuRequestDTO }, {
        onSuccess: () => closeModals()
      });
    } else {
      createMutation.mutate(values as NhanSuRequestDTO, {
        onSuccess: () => closeModals()
      });
    }
  }

  const confirmDelete = () => {
    if (deleteEmployee) {
      deleteMutation.mutate(deleteEmployee.maNs, {
        onSuccess: () => setDeleteEmployee(null)
      });
    }
  }

  return (
    <div className="p-8 space-y-8 flex-1 min-h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản lý nhân sự</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Danh sách toàn bộ nhân viên và bác sĩ trong hệ thống.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.02]">
          <Plus className="mr-2 h-5 w-5" /> Thêm nhân viên
        </Button>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
        <Input 
          type="text" 
          placeholder="Tìm theo tên hoặc SĐT..." 
          className="pl-11 h-12 bg-white/70 backdrop-blur-md border-slate-200/60 shadow-sm rounded-xl focus-visible:ring-blue-500 transition-all text-slate-800" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent border-b border-slate-100">
              <TableHead className="font-semibold text-slate-600 py-4 pl-6">Mã NV</TableHead>
              <TableHead className="font-semibold text-slate-600 py-4">Họ và tên</TableHead>
              <TableHead className="font-semibold text-slate-600 py-4">Liên hệ</TableHead>
              <TableHead className="font-semibold text-slate-600 py-4">Chức vụ</TableHead>
              <TableHead className="font-semibold text-slate-600 py-4">Nhóm quyền</TableHead>
              <TableHead className="text-right font-semibold text-slate-600 py-4 pr-6">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <Loader2 className="animate-spin h-8 w-8 mx-auto text-blue-600 mb-4" />
                  <p className="text-sm text-slate-500 font-medium">Đang tải dữ liệu...</p>
                </TableCell>
              </TableRow>
            ) : employees.length > 0 ? (
              employees.map((emp) => (
                <TableRow key={emp.maNs} className="hover:bg-blue-50/40 transition-colors border-b border-slate-100/50 group">
                  <TableCell className="font-semibold text-blue-600 pl-6">{emp.maNs}</TableCell>
                  <TableCell className="font-medium text-slate-800">{emp.hoTen}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-slate-700">{emp.sdt}</div>
                    <div className="text-xs text-slate-500">{emp.email || "Không có email"}</div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60 shadow-sm">
                       {emp.tenChucVu || "Chưa có"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {emp.taiKhoan?.loaiTk ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-sm">
                        <Shield className="mr-1.5 w-3.5 h-3.5 text-indigo-500" /> {
                          listNhomQuyen?.find(n => n.maNhom === emp.taiKhoan?.loaiTk)?.tenNhom || emp.taiKhoan?.loaiTk
                        }
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Không có TK</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-slate-200/50"><MoreHorizontal className="h-4 w-4 text-slate-500" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-100 shadow-xl p-1.5 w-36">
                        <DropdownMenuItem onClick={() => openEdit(emp)} className="rounded-xl cursor-pointer hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 font-medium py-2.5 transition-colors">
                          <Pencil className="mr-2.5 h-4 w-4" /> Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteEmployee(emp)} className="rounded-xl cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 font-medium py-2.5 transition-colors mt-1">
                          <Trash2 className="mr-2.5 h-4 w-4" /> Xóa bỏ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                  <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">Không tìm thấy nhân viên nào.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit / Add Dialog */}
      <Dialog open={isAddOpen || !!editEmployee} onOpenChange={(open) => !open && closeModals()}>
        <DialogContent className="sm:max-w-[650px] bg-white/95 backdrop-blur-2xl border border-white/40 shadow-[0_20px_60px_rgb(0,0,0,0.1)] rounded-[2rem] p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
              {editEmployee ? "Cập nhật nhân sự" : "Thêm nhân sự mới"}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {editEmployee ? "Chỉnh sửa thông tin liên hệ và vai trò." : "Hệ thống sẽ tự động tạo tài khoản đăng nhập tương ứng."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5 bg-slate-50/70 p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="font-semibold text-slate-800 text-sm flex items-center mb-4"><Shield className="w-4 h-4 mr-2 text-indigo-500" />Tài khoản & Phân quyền</h3>
                  <FormField control={form.control} name="username" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Tên đăng nhập</FormLabel>
                      <FormControl><Input placeholder="Ví dụ: ky.nguyen" className="bg-white rounded-xl h-11" disabled={!!editEmployee} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="maNhom" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Nhóm quyền</FormLabel>
                      <Select 
                        onValueChange={(val) => {
                          field.onChange(val);
                          const cvVal = nhomToChucVuMap[val];
                          if (cvVal) {
                            form.setValue("maChucVu", cvVal);
                          }
                        }} 
                        defaultValue={field.value} 
                        value={field.value}
                      >
                        <FormControl><SelectTrigger className="bg-white rounded-xl h-11"><SelectValue placeholder="Chọn nhóm quyền" /></SelectTrigger></FormControl>
                        <SelectContent className="bg-white/95 backdrop-blur-xl rounded-xl border border-slate-100 shadow-lg">
                          {listNhomQuyen?.map((nhom) => (
                            <SelectItem key={nhom.maNhom} value={nhom.maNhom} className="rounded-lg">{nhom.tenNhom}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="maChucVu" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Chức vụ thực tế</FormLabel>
                      <Select 
                        onValueChange={(val) => {
                          field.onChange(val);
                          const nhomVal = chucVuToNhomMap[val];
                          if (nhomVal) {
                            form.setValue("maNhom", nhomVal);
                          }
                        }} 
                        defaultValue={field.value} 
                        value={field.value}
                      >
                        <FormControl><SelectTrigger className="bg-white rounded-xl h-11"><SelectValue placeholder="Chọn chức vụ" /></SelectTrigger></FormControl>
                        <SelectContent className="bg-white/95 backdrop-blur-xl rounded-xl border border-slate-100 shadow-lg">
                          {listChucVu?.map((cv) => (
                            <SelectItem key={cv.maCv} value={cv.maCv} className="rounded-lg">{cv.tenCv}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <div className="space-y-5 bg-slate-50/70 p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="font-semibold text-slate-800 text-sm mb-4">Thông tin cá nhân</h3>
                  <FormField control={form.control} name="hoTen" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Họ và tên</FormLabel>
                      <FormControl><Input placeholder="Nguyễn Văn A" className="bg-white rounded-xl h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="sdt" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Số điện thoại</FormLabel>
                      <FormControl><Input placeholder="09..." className="bg-white rounded-xl h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Email</FormLabel>
                      <FormControl><Input placeholder="a@gmail.com" className="bg-white rounded-xl h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
                <Button type="button" variant="outline" className="rounded-xl px-6 h-11 border-slate-200 hover:bg-slate-50" onClick={closeModals}>Hủy bỏ</Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-8 h-11 shadow-md shadow-blue-500/25 transition-all hover:scale-105" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                  {editEmployee ? "Lưu thay đổi" : "Hoàn tất"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteEmployee} onOpenChange={(open) => !open && setDeleteEmployee(null)}>
        <DialogContent className="sm:max-w-[450px] bg-white rounded-3xl p-8 border-none shadow-2xl text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <AlertCircle className="w-10 h-10" />
          </div>
          <DialogTitle className="text-2xl font-bold text-slate-900 mb-2">Xác nhận xóa</DialogTitle>
          <DialogDescription className="text-slate-500 text-base mb-8 px-4">
            Bạn có chắc chắn muốn xóa nhân viên <span className="font-semibold text-slate-800">{deleteEmployee?.hoTen}</span>? Tài khoản liên kết cũng sẽ bị vô hiệu hóa.
          </DialogDescription>
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="rounded-xl px-6 h-12 border-slate-200 font-medium hover:bg-slate-50" onClick={() => setDeleteEmployee(null)}>Hủy bỏ</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-8 h-12 shadow-lg shadow-red-500/25 font-semibold transition-transform hover:scale-105" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : "Đồng ý xóa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}