"use client"

import * as React from "react"
import { CalendarPlus, Filter, CalendarDays, Clock, Trash2, Loader2, AlertCircle } from "lucide-react"

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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

import type { LichLamViecRequestDTO } from "@/types/staff"
import { 
  useDanhSachLichLamViec, 
  useDanhSachNhanSu, 
  useCreateLichLamViec, 
  useDeleteLichLamViec 
} from "@/hooks/useStaff"

export default function SchedulesPage() {
  const [dateFilter, setDateFilter] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null)
  
  const [formValue, setFormValue] = React.useState<LichLamViecRequestDTO>({
    maNs: "",
    ngayLam: "",
    gioBatDau: 8,
    gioKetThuc: 12,
  })

  const { data: scheduleData, isLoading: scheduleLoading } = useDanhSachLichLamViec(0, 50)
  const { data: nhanSuData } = useDanhSachNhanSu(0, 100, "")

  const createMutation = useCreateLichLamViec()
  const deleteMutation = useDeleteLichLamViec()

  // @ts-ignore
  const schedules = scheduleData?.content || scheduleData?.data || (Array.isArray(scheduleData) ? scheduleData : [])
  // @ts-ignore
  const staffOptions = nhanSuData?.content || nhanSuData?.data || (Array.isArray(nhanSuData) ? nhanSuData : [])

  const filteredSchedules = schedules.filter((item: any) =>
    !dateFilter || item.ngayLam === dateFilter
  )

  const handleCreate = () => {
    createMutation.mutate(formValue, {
      onSuccess: () => {
        setIsDialogOpen(false)
        setFormValue({ maNs: "", ngayLam: "", gioBatDau: 8, gioKetThuc: 12 })
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
    <div className="p-8 space-y-8 flex-1 bg-slate-50/50 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-orange-100/50 rounded-xl">
              <CalendarDays className="w-8 h-8 text-orange-600" />
            </div>
            Lịch làm việc
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Phân công ca trực và quản lý lịch làm việc thực tế cho bác sĩ, nhân viên.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 shadow-md shadow-orange-500/20 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.02]">
          <CalendarPlus className="mr-2 h-5 w-5" /> Xếp lịch mới
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative w-full md:w-64">
          <CalendarDays className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          <Input
            type="date"
            className="pl-11 h-12 bg-white/70 backdrop-blur-md border-slate-200/60 shadow-sm rounded-xl focus-visible:ring-orange-500 transition-all text-slate-800"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <Button variant="outline" className="bg-white/70 backdrop-blur-md border-slate-200/60 shadow-sm rounded-xl h-12 px-6 hover:bg-slate-50 font-medium" onClick={() => setDateFilter("")}>
          <Filter className="mr-2 h-4 w-4 text-slate-500" /> Xóa bộ lọc
        </Button>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent border-b border-slate-100">
              <TableHead className="font-semibold text-slate-600 py-4 pl-6 w-[120px]">Mã lịch</TableHead>
              <TableHead className="font-semibold text-slate-600 py-4 w-[160px]">Ngày trực</TableHead>
              <TableHead className="font-semibold text-slate-600 py-4">Ca làm việc</TableHead>
              <TableHead className="font-semibold text-slate-600 py-4">Nhân sự</TableHead>
              <TableHead className="font-semibold text-slate-600 py-4">Chức vụ</TableHead>
              <TableHead className="text-right font-semibold text-slate-600 py-4 pr-6">Tùy chọn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduleLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-slate-500">
                  <Loader2 className="animate-spin h-8 w-8 mx-auto text-orange-600 mb-4" />
                  <p className="font-medium">Đang tải lịch làm việc...</p>
                </TableCell>
              </TableRow>
            ) : filteredSchedules.length ? (
              filteredSchedules.map((schedule: any) => (
                <TableRow key={schedule.maLlv} className="hover:bg-orange-50/40 transition-colors border-b border-slate-100/50 group">
                  <TableCell className="py-4 pl-6 font-semibold text-slate-500">{schedule.maLlv}</TableCell>
                  <TableCell className="py-4 font-bold text-slate-800">{schedule.ngayLam}</TableCell>
                  <TableCell className="py-4 text-slate-700">
                    <div className="flex items-center gap-2 font-medium bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg w-max border border-orange-200/50">
                      <Clock className="w-4 h-4 text-orange-500" />
                      {`${Number(schedule.gioBatDau).toFixed(2).replace('.00', ':00').replace('.50', ':30')} - ${Number(schedule.gioKetThuc).toFixed(2).replace('.00', ':00').replace('.50', ':30')}`}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 font-semibold text-slate-900">{schedule.tenNhanSu}</TableCell>
                  <TableCell className="py-4">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60 shadow-sm">
                      {schedule.chucVu}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 pr-6 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all rounded-xl"
                      onClick={() => setDeleteConfirm(schedule.maLlv)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 text-slate-500">
                  <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <CalendarDays className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="font-medium">Chưa có lịch làm việc nào được phân công.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] bg-white/95 backdrop-blur-2xl border border-white/40 shadow-[0_20px_60px_rgb(0,0,0,0.1)] rounded-[2rem] p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-slate-900">Xếp lịch làm việc mới</DialogTitle>
            <DialogDescription className="text-slate-500 mt-2">
              Chọn nhân sự, ngày và khoảng thời gian trực để ghi vào hệ thống.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 bg-slate-50/70 p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="maNs" className="text-slate-700 font-medium">Nhân sự thực hiện</Label>
              <Select value={formValue.maNs} onValueChange={(val) => setFormValue({ ...formValue, maNs: val })}>
                <SelectTrigger className="bg-white rounded-xl h-11 w-full">
                  <SelectValue placeholder="Chọn nhân sự..." />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl rounded-xl border-slate-100 max-h-60">
                  {staffOptions.map((staff: any) => (
                    <SelectItem key={staff.maNs} value={staff.maNs} className="rounded-lg">
                      {staff.hoTen} - <span className="text-slate-500 text-sm">{staff.tenChucVu || staff.maNs}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ngayLam" className="text-slate-700 font-medium">Ngày trực</Label>
              <Input
                id="ngayLam"
                type="date"
                value={formValue.ngayLam}
                onChange={(e) => setFormValue({ ...formValue, ngayLam: e.target.value })}
                className="bg-white rounded-xl h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gioBatDau" className="text-slate-700 font-medium">Giờ bắt đầu</Label>
                <Select value={formValue.gioBatDau.toString()} onValueChange={(val) => setFormValue({ ...formValue, gioBatDau: Number(val) })}>
                  <SelectTrigger className="bg-white rounded-xl h-11">
                    <SelectValue placeholder="Từ mấy giờ" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl rounded-xl border-slate-100 max-h-60">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <React.Fragment key={i}>
                        <SelectItem value={`${i}.00`} className="rounded-lg">{i.toString().padStart(2, '0')}:00</SelectItem>
                        <SelectItem value={`${i}.50`} className="rounded-lg">{i.toString().padStart(2, '0')}:30</SelectItem>
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gioKetThuc" className="text-slate-700 font-medium">Giờ kết thúc</Label>
                <Select value={formValue.gioKetThuc.toString()} onValueChange={(val) => setFormValue({ ...formValue, gioKetThuc: Number(val) })}>
                  <SelectTrigger className="bg-white rounded-xl h-11">
                    <SelectValue placeholder="Đến mấy giờ" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl rounded-xl border-slate-100 max-h-60">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <React.Fragment key={i}>
                        <SelectItem value={`${i}.00`} className="rounded-lg">{i.toString().padStart(2, '0')}:00</SelectItem>
                        <SelectItem value={`${i}.50`} className="rounded-lg">{i.toString().padStart(2, '0')}:30</SelectItem>
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-8 pt-6 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl px-6 h-11 hover:bg-slate-50">Hủy</Button>
            <Button type="button" onClick={handleCreate} disabled={createMutation.isPending} className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 shadow-md shadow-orange-500/20 text-white rounded-xl px-8 h-11 transition-transform hover:scale-105">
              {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Tạo lịch
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
            Bạn có chắc chắn muốn xóa lịch làm việc này? Lịch hẹn của khách hàng có thể bị ảnh hưởng.
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
