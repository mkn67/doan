"use client"

import * as React from "react"
import { ShieldPlus, Search, Settings2, Users, Loader2, AlertCircle, Trash2 } from "lucide-react"
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
import type { NhomRequestDTO, NhomResponseDTO } from "@/types/staff"
import { 
  useDanhSachNhomQuyen, 
  useCreateNhomQuyen, 
  useUpdateNhomQuyen, 
  useDeleteNhomQuyen 
} from "@/hooks/useStaff"

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingNhom, setEditingNhom] = React.useState<NhomResponseDTO | null>(null)
  const [formValue, setFormValue] = React.useState<NhomRequestDTO>({ tenNhom: "", moTa: "" })
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null)

  const { data: nhomData, isLoading } = useDanhSachNhomQuyen()
  const createMutation = useCreateNhomQuyen()
  const updateMutation = useUpdateNhomQuyen()
  const deleteMutation = useDeleteNhomQuyen()

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
      updateMutation.mutate({ maNhom: editingNhom.maNhom, data: formValue }, {
        onSuccess: () => {
          setEditingNhom(null)
          setFormValue({ tenNhom: "", moTa: "" })
          setIsDialogOpen(false)
        }
      })
    } else {
      createMutation.mutate(formValue, {
        onSuccess: () => {
          setFormValue({ tenNhom: "", moTa: "" })
          setIsDialogOpen(false)
        }
      })
    }
  }

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm, {
        onSuccess: () => setDeleteConfirm(null)
      })
    }
  }

  const filteredRoles = (nhomData ?? []).filter((role) =>
    role.tenNhom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.maNhom?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-[calc(100vh-4rem)] flex-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-100/50 rounded-xl">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            Phân quyền hệ thống
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-sm">
            Thiết lập quyền truy cập và quản lý nhóm chức danh cho nhân sự Vision Care.
          </p>
        </div>
        <Button onClick={handleOpenDialog} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/20 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.02]">
          <ShieldPlus className="mr-2 h-5 w-5" /> Thêm nhóm quyền
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Tìm theo mã hoặc tên nhóm..."
            className="pl-11 h-12 bg-white/70 backdrop-blur-md border-slate-200/60 shadow-sm rounded-xl focus-visible:ring-indigo-500 transition-all text-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent border-b border-slate-100">
              <TableHead className="w-[140px] font-semibold text-slate-600 py-4 pl-6">Mã nhóm</TableHead>
              <TableHead className="w-[250px] font-semibold text-slate-600 py-4">Tên chức danh</TableHead>
              <TableHead className="font-semibold text-slate-600 py-4">Mô tả</TableHead>
              <TableHead className="font-semibold text-slate-600 py-4">Số quyền</TableHead>
              <TableHead className="text-right font-semibold text-slate-600 py-4 pr-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-slate-500">
                  <Loader2 className="animate-spin h-8 w-8 mx-auto text-indigo-600 mb-4" />
                  <p className="font-medium">Đang tải danh sách nhóm quyền...</p>
                </TableCell>
              </TableRow>
            ) : filteredRoles.length > 0 ? (
              filteredRoles.map((role) => (
                <TableRow key={role.maNhom} className="hover:bg-indigo-50/40 transition-colors border-b border-slate-100/50 group">
                  <TableCell className="font-semibold text-indigo-600 pl-6">{role.maNhom}</TableCell>
                  <TableCell className="font-semibold text-slate-800">{role.tenNhom}</TableCell>
                  <TableCell className="text-slate-600 text-sm font-medium">{role.moTa || <span className="text-slate-300 italic">Không có mô tả</span>}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/60 shadow-sm">
                      {role.danhSachVaiTro?.length ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 rounded-xl font-medium px-4"
                        onClick={() => handleEdit(role)}
                      >
                        <Settings2 className="w-4 h-4 mr-2" /> Sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 rounded-xl font-medium px-4"
                        onClick={() => setDeleteConfirm(role.maNhom)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Xóa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-slate-500">
                  <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <ShieldPlus className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="font-medium">Không tìm thấy nhóm quyền nào.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-2xl border border-white/40 shadow-[0_20px_60px_rgb(0,0,0,0.1)] rounded-[2rem] p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold text-slate-900">{editingNhom ? "Cập nhật nhóm quyền" : "Thêm nhóm quyền mới"}</DialogTitle>
            <DialogDescription className="text-slate-500">
              {editingNhom
                ? "Cập nhật thông tin nhóm quyền và lưu lại để thay đổi."
                : "Tạo nhóm quyền mới cho quy trình vận hành và phân quyền hệ thống."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="tenNhom" className="text-slate-700 font-medium">Tên nhóm</Label>
              <Input
                id="tenNhom"
                value={formValue.tenNhom}
                onChange={(e) => setFormValue({ ...formValue, tenNhom: e.target.value })}
                className="bg-slate-50/50 rounded-xl h-11"
                placeholder="Ví dụ: Bác sĩ, Lễ tân..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moTa" className="text-slate-700 font-medium">Mô tả chi tiết</Label>
              <Input
                id="moTa"
                value={formValue.moTa ?? ""}
                onChange={(e) => setFormValue({ ...formValue, moTa: e.target.value })}
                className="bg-slate-50/50 rounded-xl h-11"
                placeholder="Mô tả nhóm quyền..."
              />
            </div>
          </div>
          <DialogFooter className="mt-8 pt-6 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl px-6 h-11 hover:bg-slate-50">Hủy</Button>
            <Button type="button" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/20 text-white rounded-xl px-6 h-11 transition-transform hover:scale-105">
              {createMutation.isPending || updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} 
              {editingNhom ? "Lưu thay đổi" : "Tạo nhóm quyền"}
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
            Bạn có chắc chắn muốn xóa nhóm quyền này? Các nhân viên đang thuộc nhóm có thể mất quyền truy cập.
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
