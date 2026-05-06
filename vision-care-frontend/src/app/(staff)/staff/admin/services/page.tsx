"use client"

import * as React from "react"
import { PlusCircle, Search, Stethoscope, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

const mockServices = [
  { id: "SV01", name: "Khám mắt tổng quát", category: "Khám bệnh", price: 200000, status: "Đang cung cấp" },
  { id: "SV02", name: "Đo khúc xạ tự động", category: "Đo lường", price: 100000, status: "Đang cung cấp" },
  { id: "SV03", name: "Chụp đáy mắt màu", category: "Chẩn đoán hình ảnh", price: 350000, status: "Đang cung cấp" },
  { id: "SV04", name: "Phẫu thuật Lasik cận thị", category: "Phẫu thuật", price: 20000000, status: "Tạm ngưng" },
]

export default function ServicesPage() {
  // Hàm format tiền VNĐ
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  return (
    <div className="p-6 space-y-6 flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Danh mục dịch vụ</h1>
          <p className="text-sm text-slate-500">Quản lý các dịch vụ khám chữa bệnh và bảng giá.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <PlusCircle className="mr-2 h-4 w-4" /> Thêm dịch vụ
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input type="text" placeholder="Tìm tên dịch vụ..." className="pl-9 bg-white" />
        </div>
      </div>

      <div className="bg-white rounded-md border shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px] font-semibold">Mã DV</TableHead>
              <TableHead className="font-semibold">Tên dịch vụ</TableHead>
              <TableHead className="font-semibold">Nhóm dịch vụ</TableHead>
              <TableHead className="font-semibold text-right">Đơn giá</TableHead>
              <TableHead className="font-semibold text-center">Trạng thái</TableHead>
              <TableHead className="text-right font-semibold">Tùy chọn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockServices.map((svc) => (
              <TableRow key={svc.id} className="hover:bg-slate-50">
                <TableCell className="font-medium text-slate-500">{svc.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 font-medium text-slate-900">
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    {svc.name}
                  </div>
                </TableCell>
                <TableCell className="text-slate-600">{svc.category}</TableCell>
                <TableCell className="text-right font-semibold text-emerald-600">
                  {formatVND(svc.price)}
                </TableCell>
                <TableCell className="text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    svc.status === 'Đang cung cấp' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {svc.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4 text-slate-500" />
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