"use client";

import React, { useState } from "react";
import { 
  Star, MessageSquare, Search, Filter, 
  ThumbsUp, ThumbsDown, UserCircle, Calendar
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

// MOCK DATA: Chờ m nối API (useDanhSachDanhGia) thì thay bằng data thật
const mockReviews = [
  {
    id: "REV001",
    tenKhach: "Nguyễn Văn A",
    dichVu: "Khám mắt tổng quát",
    bacSi: "BS. Đặng Thu Diễm",
    soSao: 5,
    noiDung: "Bác sĩ khám rất kỹ, nhiệt tình. Phòng khám sạch sẽ.",
    ngayDanhGia: "12/05/2026",
    trangThai: "ĐÃ DUYỆT"
  },
  {
    id: "REV002",
    tenKhach: "Trần Thị B",
    dichVu: "Cắt kính cận",
    bacSi: "KTV. Lê Văn Luyện",
    soSao: 2,
    noiDung: "Làm kính hơi lâu, ngồi chờ mỏi cả lưng. Đề nghị cải thiện tốc độ.",
    ngayDanhGia: "11/05/2026",
    trangThai: "CHỜ XỬ LÝ"
  }
];

export default function CrmReviewsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Nút render ngôi sao vàng/xám
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-pink-100 text-pink-600 rounded-xl shadow-sm">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Đánh giá & Phản hồi</h1>
            <p className="text-slate-500 mt-1">Lắng nghe ý kiến khách hàng để nâng cao chất lượng dịch vụ.</p>
          </div>
        </div>
      </div>

      {/* THỐNG KÊ NHANH */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-yellow-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Đánh giá trung bình</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-slate-800">4.8</span>
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Phản hồi Tích cực (4-5 sao)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-slate-800">156</span>
              <ThumbsUp className="w-6 h-6 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-rose-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Cần cải thiện (1-3 sao)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-slate-800">4</span>
              <ThumbsDown className="w-6 h-6 text-rose-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BỘ LỌC */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Tìm theo tên khách hàng, số điện thoại..." 
            className="pl-9 bg-slate-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" /> Lọc theo số sao
        </Button>
      </div>

      {/* BẢNG DANH SÁCH ĐÁNH GIÁ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[200px]">Khách hàng</TableHead>
              <TableHead className="w-[150px]">Đánh giá</TableHead>
              <TableHead>Nội dung phản hồi</TableHead>
              <TableHead className="w-[200px]">Dịch vụ / Bác sĩ</TableHead>
              <TableHead className="text-right">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockReviews.map((review) => (
              <TableRow key={review.id} className="hover:bg-slate-50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-8 h-8 text-slate-300" />
                    <div>
                      <p className="font-semibold text-slate-800">{review.tenKhach}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> {review.ngayDanhGia}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {renderStars(review.soSao)}
                  <span className="text-xs text-slate-500 font-medium mt-1 inline-block">
                    {review.soSao} / 5 điểm
                  </span>
                </TableCell>
                <TableCell className="max-w-md">
                  <p className="text-sm text-slate-700 font-medium">&quot;{review.noiDung}&quot;</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-semibold text-blue-600">{review.dichVu}</p>
                  <p className="text-xs text-slate-500">{review.bacSi}</p>
                </TableCell>
                <TableCell className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    review.trangThai === "ĐÃ DUYỆT" 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>
                    {review.trangThai}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
    </div>
  );
}