"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarPlus, Filter, CalendarDays, Clock, Trash2 } from "lucide-react"

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
import type { LichLamViecRequestDTO } from "@/types/staff"

export default function SchedulesPage() {
  const [dateFilter, setDateFilter] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [formValue, setFormValue] = React.useState<LichLamViecRequestDTO>({
    maNs: "",
    ngayLam: "",
    gioBatDau: 8,
    gioKetThuc: 12,
  })

  const queryClient = useQueryClient()

  const { data: scheduleData, isLoading: scheduleLoading } = useQuery({
    queryKey: ["lich-lam-viec", 0, 20],
    queryFn: async () => staffApi.getDanhSachLichLamViec(0, 20),
  })

  const { data: nhanSuData } = useQuery({
    queryKey: ["danh-sach-nhan-su", 0, 50, ""],
    queryFn: async () => staffApi.getDanhSachNhanSu(0, 50, ""),
  })

  const createMutation = useMutation({
    mutationFn: (data: LichLamViecRequestDTO) => staffApi.createLichLamViec(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lich-lam-viec"] })
      setIsDialogOpen(false)
      setFormValue({ maNs: "", ngayLam: "", gioBatDau: 8, gioKetThuc: 12 })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (maLlv: string) => staffApi.deleteLichLamViec(maLlv),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lich-lam-viec"] }),
  })

  const schedules = scheduleData?.content ?? []
  const staffOptions = nhanSuData?.content ?? []

  const filteredSchedules = schedules.filter((item) =>
    !dateFilter || item.ngayLam === dateFilter
  )

  const handleCreate = () => {
    createMutation.mutate(formValue)
  }

  const handleDelete = (maLlv: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa lịch này?")) {
      deleteMutation.mutate(maLlv)
    }
  }

  return (
    <div className="p-6 space-y-6 flex-1 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lịch làm việc</h1>
          <p className="text-sm text-slate-500">Phân công ca trực và quản lý lịch làm việc thực tế.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
          <CalendarPlus className="mr-2 h-4 w-4" /> Xếp lịch mới
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative w-full md:w-64">
          <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="date"
            className="pl-9 bg-white text-slate-600"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <Button variant="outline" className="bg-white" onClick={() => setDateFilter("")}
        >
          <Filter className="mr-2 h-4 w-4" /> Xóa lọc
        </Button>
      </div>

      <div className="bg-white rounded-md border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold">Mã lịch</TableHead>
              <TableHead className="font-semibold">Ngày trực</TableHead>
              <TableHead className="font-semibold">Ca làm việc</TableHead>
              <TableHead className="font-semibold">Nhân sự</TableHead>
              <TableHead className="font-semibold">Chức vụ</TableHead>
              <TableHead className="text-right font-semibold">Tùy chọn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduleLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                  Đang tải lịch làm việc...
                </TableCell>
              </TableRow>
            ) : filteredSchedules.length ? (
              filteredSchedules.map((schedule) => (
                <TableRow key={schedule.maLlv} className="hover:bg-slate-50">
                  <TableCell className="py-4 px-4 font-medium text-slate-900">{schedule.maLlv}</TableCell>
                  <TableCell className="py-4 px-4 text-slate-700">{schedule.ngayLam}</TableCell>
                  <TableCell className="py-4 px-4 text-slate-700">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4 text-orange-500" />
                      {`${schedule.gioBatDau.toFixed(2)} - ${schedule.gioKetThuc.toFixed(2)}`}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4 text-slate-900">{schedule.tenNhanSu}</TableCell>
                  <TableCell className="py-4 px-4 text-slate-600">{schedule.chucVu}</TableCell>
                  <TableCell className="py-4 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50"
                      onClick={() => handleDelete(schedule.maLlv)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                  Chưa có lịch làm việc nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Xếp lịch mới</DialogTitle>
            <DialogDescription>
              Chọn nhân sự thực, ngày và ca trực rồi lưu lại để ghi vào hệ thống.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maNs" className="text-right">Nhân sự</Label>
              <select
                id="maNs"
                title="Chọn nhân sự"
                value={formValue.maNs}
                onChange={(e) => setFormValue({ ...formValue, maNs: e.target.value })}
                className="col-span-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-700"
              >
                <option value="">Chọn nhân sự</option>
                {staffOptions.map((staff) => (
                  <option key={staff.maNs} value={staff.maNs}>
                    {staff.hoTen} ({staff.maNs})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ngayLam" className="text-right">Ngày trực</Label>
              <Input
                id="ngayLam"
                type="date"
                value={formValue.ngayLam}
                onChange={(e) => setFormValue({ ...formValue, ngayLam: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gioBatDau" className="text-right">Giờ bắt đầu</Label>
              <Input
                id="gioBatDau"
                type="number"
                min={0}
                max={23}
                step={0.5}
                value={formValue.gioBatDau}
                onChange={(e) => setFormValue({ ...formValue, gioBatDau: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gioKetThuc" className="text-right">Giờ kết thúc</Label>
              <Input
                id="gioKetThuc"
                type="number"
                min={0}
                max={24}
                step={0.5}
                value={formValue.gioKetThuc}
                onChange={(e) => setFormValue({ ...formValue, gioKetThuc: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleCreate} className="bg-orange-600 hover:bg-orange-700">
              Tạo lịch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
