"use client"

import * as React from "react"
import { useMemo, useState } from "react"
import { PlusCircle, Search, Stethoscope, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
import { staffApi } from "@/lib/api/staff.api"
import type { DichVuKhamRequest, DichVuKhamResponse } from "@/types/clinic"

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedService, setSelectedService] = useState<DichVuKhamResponse | null>(null)
  const [formValue, setFormValue] = useState<DichVuKhamRequest>({ tenDv: "", giaDv: 0, moTa: "" })

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["danh-sach-dich-vu-kham", 0, 50],
    queryFn: async () => staffApi.getDanhSachDichVuKham(0, 50),
  })

  const createMutation = useMutation({
    mutationFn: (data: DichVuKhamRequest) => staffApi.createDichVuKham(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["danh-sach-dich-vu-kham"] })
      setOpenCreate(false)
      setFormValue({ tenDv: "", giaDv: 0, moTa: "" })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ maDv, data }: { maDv: string; data: DichVuKhamRequest }) => staffApi.updateDichVuKham(maDv, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["danh-sach-dich-vu-kham"] })
      setOpenEdit(false)
      setSelectedService(null)
      setFormValue({ tenDv: "", giaDv: 0, moTa: "" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (maDv: string) => staffApi.deleteDichVuKham(maDv),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["danh-sach-dich-vu-kham"] }),
  })

  const services = data?.content ?? []
  const filteredServices = useMemo(
    () => services.filter((service) =>
      service.tenDv.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.maDv.toLowerCase().includes(searchTerm.toLowerCase())
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
    createMutation.mutate(formValue)
  }

  const handleUpdate = () => {
    if (!selectedService) return
    updateMutation.mutate({ maDv: selectedService.maDv, data: formValue })
  }

  const handleDelete = (maDv: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
      deleteMutation.mutate(maDv)
    }
  }

  return (
    <div className="p-6 space-y-6 flex-1 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Danh mục dịch vụ</h1>
          <p className="text-sm text-slate-500">Quản lý các dịch vụ khám chữa bệnh và bảng giá chính xác.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-emerald-600 hover:bg-emerald-700">
          <PlusCircle className="mr-2 h-4 w-4" /> Thêm dịch vụ
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Tìm theo mã hoặc tên dịch vụ..."
            className="pl-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-md border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[120px] font-semibold">Mã dịch vụ</TableHead>
              <TableHead className="font-semibold">Tên dịch vụ</TableHead>
              <TableHead className="font-semibold">Mô tả</TableHead>
              <TableHead className="text-right font-semibold">Đơn giá</TableHead>
              <TableHead className="text-center font-semibold">Trạng thái</TableHead>
              <TableHead className="text-right font-semibold">Tùy chọn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                  Đang tải danh sách dịch vụ khám...
                </TableCell>
              </TableRow>
            ) : filteredServices.length ? (
              filteredServices.map((svc) => (
                <TableRow key={svc.maDv} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-500">{svc.maDv}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium text-slate-900">
                      <Stethoscope className="w-4 h-4 text-emerald-600" />
                      {svc.tenDv}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">{svc.moTa ?? "-"}</TableCell>
                  <TableCell className="text-right font-semibold text-emerald-600">{formatVND(svc.giaDv)}</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                      Hoạt động
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleEdit(svc)}>
                          <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-rose-600 focus:text-rose-600" onClick={() => handleDelete(svc.maDv)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Xóa dịch vụ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                  Chưa có dịch vụ khám nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm dịch vụ khám mới</DialogTitle>
            <DialogDescription>
              Tạo dịch vụ khám mới và lưu trực tiếp vào hệ thống backend.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tenDv" className="text-right">Tên dịch vụ</Label>
              <Input
                id="tenDv"
                value={formValue.tenDv}
                onChange={(e) => setFormValue({ ...formValue, tenDv: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="giaDv" className="text-right">Đơn giá</Label>
              <Input
                id="giaDv"
                type="number"
                value={formValue.giaDv}
                onChange={(e) => setFormValue({ ...formValue, giaDv: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="moTa" className="text-right">Mô tả</Label>
              <Input
                id="moTa"
                value={formValue.moTa ?? ""}
                onChange={(e) => setFormValue({ ...formValue, moTa: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700">
              Tạo dịch vụ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa dịch vụ</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin dịch vụ và lưu lại.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editTenDv" className="text-right">Tên dịch vụ</Label>
              <Input
                id="editTenDv"
                value={formValue.tenDv}
                onChange={(e) => setFormValue({ ...formValue, tenDv: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editGiaDv" className="text-right">Đơn giá</Label>
              <Input
                id="editGiaDv"
                type="number"
                value={formValue.giaDv}
                onChange={(e) => setFormValue({ ...formValue, giaDv: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editMoTa" className="text-right">Mô tả</Label>
              <Input
                id="editMoTa"
                value={formValue.moTa ?? ""}
                onChange={(e) => setFormValue({ ...formValue, moTa: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700">
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
