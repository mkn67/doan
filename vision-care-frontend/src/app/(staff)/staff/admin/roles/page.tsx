"use client"

import * as React from "react"
import { ShieldPlus, Search, ShieldCheck, Settings2, Users } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
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
import type { NhomRequestDTO, NhomResponseDTO } from "@/types/staff"

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingNhom, setEditingNhom] = React.useState<NhomResponseDTO | null>(null)
  const [formValue, setFormValue] = React.useState<NhomRequestDTO>({ tenNhom: "", moTa: "" })
  const queryClient = useQueryClient()

  const { data: nhomData, isLoading } = useQuery({
    queryKey: ["nhom-quyen"],
    queryFn: async () => staffApi.getDanhSachNhomQuyen(),
  })

  const createMutation = useMutation({
    mutationFn: (data: NhomRequestDTO) => staffApi.createNhomQuyen(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nhom-quyen"] })
      setFormValue({ tenNhom: "", moTa: "" })
      setIsDialogOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ maNhom, data }: { maNhom: string; data: NhomRequestDTO }) => staffApi.updateNhomQuyen(maNhom, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nhom-quyen"] })
      setEditingNhom(null)
      setFormValue({ tenNhom: "", moTa: "" })
      setIsDialogOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (maNhom: string) => staffApi.deleteNhomQuyen(maNhom),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nhom-quyen"] }),
  })

  const handleOpenDialog = () => {
    setEditingNhom(null)
    setFormValue({ tenNhom: "", moTa: "" })
    setIsDialogOpen(true)
  }

  const handleEdit = (item: NhomResponseDTO) => {
    setEditingNhom(item)
    setFormValue({ tenNhom: item.tenNhom, moTa: item.moTa ?? "" })
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (editingNhom) {
      updateMutation.mutate({ maNhom: editingNhom.maNhom, data: formValue })
    } else {
      createMutation.mutate(formValue)
    }
  }

  const handleDelete = (maNhom: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhóm quyền này?")) {
      deleteMutation.mutate(maNhom)
    }
  }

  const filteredRoles = (nhomData ?? []).filter((role) =>
    role.tenNhom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.maNhom.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8 text-indigo-600" />
            Phân quyền hệ thống
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Thiết lập quyền truy cập và quản lý nhóm chức danh cho nhân sự Vision Care.
          </p>
        </div>
        <Button onClick={handleOpenDialog} className="bg-indigo-600 hover:bg-indigo-700 shadow-md h-10 font-medium">
          <ShieldPlus className="mr-2 h-4 w-4" /> Thêm nhóm quyền
        </Button>
      </div>

      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo mã hoặc tên nhóm..."
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-left border-collapse">
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow>
                <TableHead className="w-[120px] font-semibold text-slate-600 py-4 px-6">Mã nhóm</TableHead>
                <TableHead className="w-[200px] font-semibold text-slate-600 py-4 px-6">Tên chức danh</TableHead>
                <TableHead className="font-semibold text-slate-600 py-4 px-6">Mô tả</TableHead>
                <TableHead className="font-semibold text-slate-600 py-4 px-6">Số quyền</TableHead>
                <TableHead className="text-right font-semibold text-slate-600 py-4 px-6">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-slate-500">
                    Đang tải nhóm quyền...
                  </TableCell>
                </TableRow>
              ) : filteredRoles.length > 0 ? (
                filteredRoles.map((role) => (
                  <TableRow key={role.maNhom} className="hover:bg-slate-50/80 transition-colors group">
                    <TableCell className="py-4 px-6 font-medium text-indigo-600">{role.maNhom}</TableCell>
                    <TableCell className="py-4 px-6 font-semibold text-slate-800">{role.tenNhom}</TableCell>
                    <TableCell className="py-4 px-6 text-slate-600 text-sm">{role.moTa}</TableCell>
                    <TableCell className="py-4 px-6 text-slate-700">{role.danhSachVaiTro?.length ?? 0}</TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                          onClick={() => handleEdit(role)}
                        >
                          <Settings2 className="w-4 h-4 mr-1.5" /> Sửa
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:bg-rose-50"
                          onClick={() => handleDelete(role.maNhom)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                    Không tìm thấy nhóm quyền nào phù hợp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingNhom ? "Cập nhật nhóm quyền" : "Thêm nhóm quyền mới"}</DialogTitle>
            <DialogDescription>
              {editingNhom
                ? "Cập nhật thông tin nhóm quyền và lưu lại để thay đổi."
                : "Tạo nhóm quyền mới cho quy trình vận hành và phân quyền hệ thống."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tenNhom" className="text-right">Tên nhóm</Label>
              <Input
                id="tenNhom"
                value={formValue.tenNhom}
                onChange={(e) => setFormValue({ ...formValue, tenNhom: e.target.value })}
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
            <Button type="button" onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700">
              {editingNhom ? "Lưu thay đổi" : "Tạo nhóm quyền"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
