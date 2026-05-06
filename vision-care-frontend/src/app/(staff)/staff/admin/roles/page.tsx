"use client"

import * as React from "react"
import { ShieldPlus, Search, ShieldCheck, Settings2, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

// Dữ liệu giả lập (Mock) CHUẨN 100% THEO DATABASE BẢNG "NHOM"
// Mốt ông giáo chỉ cần thay bằng data từ API (ví dụ: const { data } = useDanhSachNhom())
const mockNhom = [
  { id: "NH04", name: "Quản lý", desc: "Nhóm quản lý hệ thống", permissions: ["Toàn quyền hệ thống", "Duyệt báo cáo", "Quản lý nhân sự"] },
  { id: "NH01", name: "Bác sĩ", desc: "Nhóm bác sĩ khám và điều trị", permissions: ["Khám bệnh", "Kê đơn thuốc", "Xem hồ sơ thị lực"] },
  { id: "NH06", name: "Lễ tân", desc: "Nhóm lễ tân tiếp nhận", permissions: ["Quản lý lịch hẹn", "Tiếp đón khách hàng", "Tạo hồ sơ"] },
  { id: "NH02", name: "Thu ngân", desc: "Nhóm thu ngân và thanh toán", permissions: ["Quản lý hóa đơn", "Xử lý thanh toán"] },
  { id: "NH03", name: "Thủ kho", desc: "Nhóm quản lý kho hàng", permissions: ["Nhập/Xuất kho", "Quản lý lô hàng", "Kiểm kê"] },
  { id: "NH05", name: "Kỹ thuật viên mắt kính", desc: "Nhóm kỹ thuật cắt kính", permissions: ["Xử lý kính", "Cập nhật thông số kính"] },
]

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Logic tìm kiếm cơ bản để test giao diện
  const filteredRoles = mockNhom.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    role.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* HEADER SECTION */}
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
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md h-10 font-medium">
          <ShieldPlus className="mr-2 h-4 w-4" /> Thêm nhóm quyền
        </Button>
      </div>

      {/* SEARCH SECTION */}
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

      {/* TABLE SECTION */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-left border-collapse">
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow>
                <TableHead className="w-[120px] font-semibold text-slate-600 py-4 px-6">Mã nhóm</TableHead>
                <TableHead className="w-[200px] font-semibold text-slate-600 py-4 px-6">Tên chức danh</TableHead>
                <TableHead className="font-semibold text-slate-600 py-4 px-6">Mô tả nghiệp vụ</TableHead>
                <TableHead className="font-semibold text-slate-600 py-4 px-6">Quyền hạn chính (Minh họa)</TableHead>
                <TableHead className="text-right font-semibold text-slate-600 py-4 px-6">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {filteredRoles.length > 0 ? (
                filteredRoles.map((role) => (
                  <TableRow key={role.id} className="hover:bg-slate-50/80 transition-colors group">
                    <TableCell className="py-4 px-6 font-medium text-indigo-600">
                      {role.id}
                    </TableCell>
                    <TableCell className="py-4 px-6 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        {role.name}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-slate-600 text-sm">
                      {role.desc}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex flex-wrap gap-1.5">
                        {role.permissions.map((perm, idx) => (
                          <span 
                            key={idx} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                        <Settings2 className="w-4 h-4 mr-1.5" /> Thiết lập
                      </Button>
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
    </div>
  )
}