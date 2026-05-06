"use client"

import * as React from "react"
import { CalendarPlus, Filter, CalendarDays, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

const mockSchedules = [
  { id: "S01", date: "29/04/2026", shift: "Ca Sáng (08:00 - 12:00)", employee: "BS. Lê Văn Luyện", role: "Bác sĩ", room: "Phòng khám 01" },
  { id: "S02", date: "29/04/2026", shift: "Ca Sáng (08:00 - 12:00)", employee: "Trần Hải Anh", role: "Lễ tân", room: "Quầy tiếp đón" },
  { id: "S03", date: "29/04/2026", shift: "Ca Chiều (13:30 - 17:30)", employee: "Nguyễn Mai Kỳ", role: "Quản trị viên", room: "Phòng Server" },
  { id: "S04", date: "30/04/2026", shift: "Ca Sáng (08:00 - 12:00)", employee: "BS. Trần Thị B", role: "Bác sĩ", room: "Phòng đo khúc xạ" },
]

export default function SchedulesPage() {
  return (
    <div className="p-6 space-y-6 flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lịch làm việc</h1>
          <p className="text-sm text-slate-500">Phân công ca trực và phòng làm việc cho nhân viên.</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <CalendarPlus className="mr-2 h-4 w-4" /> Xếp lịch mới
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input type="date" className="pl-9 bg-white text-slate-600" />
        </div>
        <Button variant="outline" className="bg-white">
          <Filter className="mr-2 h-4 w-4" /> Lọc theo nhân viên
        </Button>
      </div>

      <div className="bg-white rounded-md border shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold">Ngày trực</TableHead>
              <TableHead className="font-semibold">Ca làm việc</TableHead>
              <TableHead className="font-semibold">Nhân sự</TableHead>
              <TableHead className="font-semibold">Phòng ban / Vị trí</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSchedules.map((schedule) => (
              <TableRow key={schedule.id} className="hover:bg-slate-50">
                <TableCell className="font-medium text-slate-900">{schedule.date}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-orange-500" /> {schedule.shift}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{schedule.employee}</p>
                    <p className="text-xs text-slate-500">{schedule.role}</p>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600">{schedule.room}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}