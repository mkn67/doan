"use client"

import * as React from "react"
import { ShieldPlus, Search, ShieldCheck, Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

const mockRoles = [
  { id: "R01", name: "Quản trị viên (Admin)", desc: "Toàn quyền kiểm soát hệ thống", permissions: ["Tất cả quyền"] },
  { id: "R02", name: "Bác sĩ chuyên khoa", desc: "Khám bệnh, kê đơn, xem bệnh án", permissions: ["Quản lý bệnh án", "Kê đơn thuốc", "Xem lịch khám"] },
  { id: "R03", name: "Lễ tân", desc: "Đón khách, xếp lịch, thanh toán", permissions: ["Quản lý lịch hẹn", "Quản lý hóa đơn", "Tạo hồ sơ KH"] },
  { id: "R04", name: "Thu ngân", desc: "Xử lý thanh toán, xuất hóa đơn", permissions: ["Quản lý hóa đơn", "Báo cáo doanh thu"] },
]

export default function RolesPage() {
  return (
    <div className="p-6 space-y-6 flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Phân quyền hệ thống</h1>
          <p className="text-sm text-slate-500">Thiết lập và quản lý quyền truy cập cho từng chức danh.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <ShieldPlus className="mr-2 h-4 w-4" /> Thêm vai trò mới
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input type="text" placeholder="Tìm kiếm vai trò..." className="pl-9 bg-white" />
        </div>
      </div>

      <div className="bg-white rounded-md border shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[150px] font-semibold">Tên vai trò</TableHead>
              <TableHead className="font-semibold">Mô tả</TableHead>
              <TableHead className="font-semibold">Quyền hạn chính</TableHead>
              <TableHead className="text-right font-semibold">Cấu hình</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockRoles.map((role) => (
              <TableRow key={role.id} className="hover:bg-slate-50">
                <TableCell className="font-medium text-slate-900">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    {role.name}
                  </div>
                </TableCell>
                <TableCell className="text-slate-600">{role.desc}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((perm, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {perm}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    <Settings2 className="w-4 h-4 mr-1" /> Chỉnh sửa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}