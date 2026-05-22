"use client"

import * as React from "react"
import { useMemo, useState } from "react"
import { PlusCircle, Search, Stethoscope, MoreHorizontal, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { DichVuKhamRequest, DichVuKhamResponse } from "@/types/clinic"
import { 
  useDanhSachDichVuKham, 
  useCreateDichVuKham, 
  useUpdateDichVuKham, 
  useDeleteDichVuKham 
} from "@/hooks/useStaff"

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedService, setSelectedService] = useState<DichVuKhamResponse | null>(null)
  const [formValue, setFormValue] = useState<DichVuKhamRequest>({ tenDv: "", giaDv: 0, moTa: "" })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const { data, isLoading } = useDanhSachDichVuKham(0, 50)
  
  const createMutation = useCreateDichVuKham()
  const updateMutation = useUpdateDichVuKham()
  const deleteMutation = useDeleteDichVuKham()

  // @ts-ignore
  const services: DichVuKhamResponse[] = data?.content || data?.data || (Array.isArray(data) ? data : [])
  
  const filteredServices = useMemo(
    () => services.filter((service) =>
      service.tenDv?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.maDv?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [searchTerm, services]
  )

  const formatVND = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

  const handleEdit = (service: DichVuKhamResponse) => {
    setSelectedService(service)
    setFormValue({ tenDv: service.tenDv, giaDv: service.giaDv, moTa: service.moTa ?? "" })
    setOpenEdit(true)
  }

  const handleOpenCreate = () => {
    setSelectedService(null)
    setFormValue({ tenDv: "", giaDv: 0, moTa: "" })
    setOpenCreate(true)
  }

  const handleCreate = () => {
    createMutation.mutate(formValue, {
      onSuccess: () => {
        setOpenCreate(false)
        setFormValue({ tenDv: "", giaDv: 0, moTa: "" })
      }
    })
  }

  const handleUpdate = () => {
    if (!selectedService) return
    updateMutation.mutate({ maDv: selectedService.maDv, data: formValue }, {
      onSuccess: () => {
        setOpenEdit(false)
        setSelectedService(null)
        setFormValue({ tenDv: "", giaDv: 0, moTa: "" })
      }
    })
  }

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm, {
        onSuccess: () => setDeleteConfirm(null)
      })
    }
  }

  return (
    <div className="p-8 space-y-8 flex-1 min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Danh mục dịch vụ</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Quản lý các dịch vụ khám chữa bệnh và bảng giá chính xác.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-500/20 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.02]">
          <PlusCircle className="mr-2 h-5 w-5" /> Thêm dịch vụ
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Tìm theo mã hoặc tên dịch vụ..."
            className="pl-11 h-12 bg-white/70 backdrop-blur-md border-slate-200/60 shadow-sm rounded-xl focus-visible:ring-emerald-500 transition-all text-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent border-b border-slate-100">
              <TableHead className="w-[140px] font-semibold text-slate-600 py-4 pl-6">Mã DV</TableHead>
              <TableHead className="font-semibold text-slate-600 py-4">Tên dịch vụ</TableHead>
              <TableHead className="font-semibold text-slate-600 py-4">Mô tả</TableHead>
              <TableHead className="text-right font-semibold text-slate-600 py-4">Đơn giá</TableHead>
              <TableHead className="text-center font-semibold text-slate-600 py-4">Trạng thái</TableHead>
              <TableHead className="text-right font-semibold text-slate-600 py-4 pr-6">Tùy chọn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-slate-500">
                  <Loader2 className="animate-spin h-8 w-8 mx-auto text-emerald-600 mb-4" />
                  <p className="font-medium">Đang tải danh sách dịch vụ...</p>
                </TableCell>
              </TableRow>
            ) : filteredServices.length ? (
              filteredServices.map((svc) => (
                <TableRow key={svc.maDv} className="hover:bg-emerald-50/40 transition-colors border-b border-slate-100/50 group">
                  <TableCell className="font-semibold text-slate-500 pl-6">{svc.maDv}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 font-semibold text-slate-800">
                      <div className="w-8 h-8 rounded-full bg-emerald-100/50 flex items-center justify-center">
                        <Stethoscope className="w-4 h-4 text-emerald-600" />
                      </div>
                      {svc.tenDv}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm font-medium">{svc.moTa || <span className="text-slate-300 italic">Không có mô tả</span>}</TableCell>
                  <TableCell className="text-right font-bold text-emerald-600">{formatVND(svc.giaDv)}</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-200/50 shadow-sm">
                      Hoạt động
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-slate-200/50">
                          <MoreHorizontal className="h-4 w-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-100 shadow-xl p-1.5 w-40">
                        <DropdownMenuItem className="rounded-xl cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 focus:bg-emerald-50 font-medium py-2.5 transition-colors" onClick={() => handleEdit(svc)}>
                          <Pencil className="mr-2.5 h-4 w-4" /> Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl cursor-pointer text-rose-600 hover:bg-rose-50 hover:text-rose-700 focus:bg-rose-50 font-medium py-2.5 transition-colors mt-1" onClick={() => setDeleteConfirm(svc.maDv)}>
                          <Trash2 className="mr-2.5 h-4 w-4" /> Xóa dịch vụ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 text-slate-500">
                  <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Stethoscope className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="font-medium">Chưa có dịch vụ khám nào.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-2xl border border-white/40 shadow-[0_20px_60px_rgb(0,0,0,0.1)] rounded-[2rem] p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold text-slate-900">Thêm dịch vụ khám mới</DialogTitle>
            <DialogDescription className="text-slate-500">
              Tạo dịch vụ khám mới và lưu trực tiếp vào hệ thống backend.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="tenDv" className="text-slate-700 font-medium">Tên dịch vụ</Label>
              <Input
                id="tenDv"
                value={formValue.tenDv}
                onChange={(e) => setFormValue({ ...formValue, tenDv: e.target.value })}
                className="bg-slate-50/50 rounded-xl h-11"
                placeholder="Nhập tên dịch vụ..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="giaDv" className="text-slate-700 font-medium">Đơn giá (VNĐ)</Label>
              <Input
                id="giaDv"
                type="number"
                value={formValue.giaDv || ""}
                onChange={(e) => setFormValue({ ...formValue, giaDv: Number(e.target.value) })}
                className="bg-slate-50/50 rounded-xl h-11"
                placeholder="Nhập đơn giá..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moTa" className="text-slate-700 font-medium">Mô tả chi tiết</Label>
              <Input
                id="moTa"
                value={formValue.moTa ?? ""}
                onChange={(e) => setFormValue({ ...formValue, moTa: e.target.value })}
                className="bg-slate-50/50 rounded-xl h-11"
                placeholder="Nhập mô tả..."
              />
            </div>
          </div>
          <DialogFooter className="mt-8 pt-6 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setOpenCreate(false)} className="rounded-xl px-6 h-11 hover:bg-slate-50">Hủy</Button>
            <Button type="button" onClick={handleCreate} disabled={createMutation.isPending} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-500/20 text-white rounded-xl px-6 h-11 transition-transform hover:scale-105">
              {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Tạo dịch vụ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-2xl border border-white/40 shadow-[0_20px_60px_rgb(0,0,0,0.1)] rounded-[2rem] p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold text-slate-900">Chỉnh sửa dịch vụ</DialogTitle>
            <DialogDescription className="text-slate-500">
              Cập nhật thông tin dịch vụ và lưu lại.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="editTenDv" className="text-slate-700 font-medium">Tên dịch vụ</Label>
              <Input
                id="editTenDv"
                value={formValue.tenDv}
                onChange={(e) => setFormValue({ ...formValue, tenDv: e.target.value })}
                className="bg-slate-50/50 rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editGiaDv" className="text-slate-700 font-medium">Đơn giá (VNĐ)</Label>
              <Input
                id="editGiaDv"
                type="number"
                value={formValue.giaDv}
                onChange={(e) => setFormValue({ ...formValue, giaDv: Number(e.target.value) })}
                className="bg-slate-50/50 rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editMoTa" className="text-slate-700 font-medium">Mô tả chi tiết</Label>
              <Input
                id="editMoTa"
                value={formValue.moTa ?? ""}
                onChange={(e) => setFormValue({ ...formValue, moTa: e.target.value })}
                className="bg-slate-50/50 rounded-xl h-11"
              />
            </div>
          </div>
          <DialogFooter className="mt-8 pt-6 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setOpenEdit(false)} className="rounded-xl px-6 h-11 hover:bg-slate-50">Hủy</Button>
            <Button type="button" onClick={handleUpdate} disabled={updateMutation.isPending} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 text-white rounded-xl px-6 h-11 transition-transform hover:scale-105">
              {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-[450px] bg-white rounded-3xl p-8 border-none shadow-2xl text-center">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <AlertCircle className="w-10 h-10" />
          </div>
          <DialogTitle className="text-2xl font-bold text-slate-900 mb-2">Xác nhận xóa</DialogTitle>
          <DialogDescription className="text-slate-500 text-base mb-8 px-4">
            Bạn có chắc chắn muốn xóa dịch vụ này? Hành động này sẽ ẩn dịch vụ khỏi danh sách.
          </DialogDescription>
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="rounded-xl px-6 h-12 border-slate-200 font-medium hover:bg-slate-50" onClick={() => setDeleteConfirm(null)}>Hủy bỏ</Button>
            <Button className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-8 h-12 shadow-lg shadow-rose-500/25 font-semibold transition-transform hover:scale-105" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : "Đồng ý xóa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
