"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  History, Search, ArrowLeft, Calendar, 
  User, Clock, ClipboardList, AlertCircle, 
  ShieldAlert, FileText, CheckCircle2, Sparkles, FilterX
} from "lucide-react";
import { useAuditHoSo } from "@/hooks/useClinic";
import { useAuth } from "@/hooks/useAuth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Định nghĩa role được phép truy cập trang này (Bác sĩ & Admin)
const ALLOWED_ROLES = ["ROLE_BAC_SI", "ROLE_ADMIN", "NH01", "NH04"];

function AuditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  const initialMaHoSo = searchParams.get("maHoSo") || "";
  const [maHoSoInput, setMaHoSoInput] = useState(initialMaHoSo);
  const [activeMaHoSo, setActiveMaHoSo] = useState(initialMaHoSo);
  const [isMounted, setIsMounted] = useState(false);

  // Sync state với URL khi URL thay đổi
  useEffect(() => {
    setIsMounted(true);
    const code = searchParams.get("maHoSo") || "";
    setMaHoSoInput(code);
    setActiveMaHoSo(code);
  }, [searchParams]);

  // Hook lấy audit logs
  const { data: auditLogs, isLoading, isError, refetch } = useAuditHoSo(activeMaHoSo);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = maHoSoInput.trim();
    setActiveMaHoSo(cleanInput);
    
    // Đẩy lên URL query params để hỗ trợ bookmark và reload
    const params = new URLSearchParams(window.location.search);
    if (cleanInput) {
      params.set("maHoSo", cleanInput);
    } else {
      params.delete("maHoSo");
    }
    router.push(`/staff/clinic/audit?${params.toString()}`);
  };

  // Định dạng thời gian hiển thị tiếng Việt
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  // Kiểm tra phân quyền truy cập
  const hasAccess = () => {
    if (!user) return false;
    const userRoles = user?.roles || [];
    const userGroup = user?.maNhom ? user.maNhom : null;
    return ALLOWED_ROLES.some(role => userRoles.includes(role) || role === userGroup);
  };

  if (!isMounted || authLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-purple-600 font-medium">
        Đang xác thực quyền truy cập Audit...
      </div>
    );
  }

  if (!hasAccess()) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 m-6 p-8">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-slate-800">Khu Vực Hạn Chế</h2>
        <p className="text-slate-500 mt-2 max-w-md text-center">
          Tài khoản <b>{user?.username}</b> của bạn không có thẩm quyền xem lịch sử thay đổi của hồ sơ bệnh án. Vui lòng liên hệ quản trị viên!
        </p>
        <Button onClick={() => router.push("/staff/clinic")} className="mt-6 bg-slate-800 hover:bg-slate-900 rounded-xl px-5 h-11 font-bold">
          Quay lại phòng khám
        </Button>
      </div>
    );
  }

  // Tên bệnh nhân lấy từ dòng audit log đầu tiên (nếu có)
  const patientName = auditLogs && auditLogs.length > 0 ? auditLogs[0].tenKhachHang : null;

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)] relative overflow-hidden animate-in fade-in duration-500">
      
      {/* Background Decorative Blurs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-300/10 rounded-full blur-[90px] -z-10 pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-300/10 rounded-full blur-[90px] -z-10 pointer-events-none animate-pulse" style={{ animationDelay: "2.5s" }}></div>

      {/* HEADER BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl shadow-purple-500/10 border border-purple-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push("/staff/clinic")}
              className="h-11 w-11 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white hover:text-white transition-all shadow-inner"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
                <History className="w-8 h-8" />
                Nhật ký thay đổi Hồ sơ
              </h1>
              <p className="text-purple-100/90 text-sm mt-1 flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 bg-purple-300 rounded-full animate-ping" />
                Dữ liệu Audit Trail đồng bộ từ Oracle DB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-sm font-semibold">
             <span>Vision Care Safety</span>
          </div>
        </div>
      </div>

      {/* SEARCH CARD */}
      <Card className="bg-white/80 backdrop-blur border border-slate-200/80 shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 pb-4 border-b">
          <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Search className="w-4.5 h-4.5 text-purple-600" /> Tra cứu thông tin hồ sơ
          </CardTitle>
          <CardDescription>Nhập chính xác mã hồ sơ bệnh án (VD: HS001) để truy vết toàn bộ quá trình cập nhật thị lực.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <Input
                placeholder="Nhập mã hồ sơ (VD: HS001, HS002)..."
                value={maHoSoInput}
                onChange={(e) => setMaHoSoInput(e.target.value)}
                className="pl-11 h-11 border-slate-200 focus-visible:ring-purple-500 focus-visible:border-purple-500 rounded-xl font-semibold text-slate-800 bg-slate-50/50 focus:bg-white transition-all"
              />
            </div>
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700 h-11 px-6 font-bold gap-2 shadow-md shadow-purple-600/10 hover:shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-xl shrink-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Search className="w-4.5 h-4.5" />
              )}
              Tra cứu hồ sơ
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* RESULTS DISPLAY */}
      {!activeMaHoSo ? (
        // Waiting state
        <Card className="border-dashed border-2 border-slate-200/80 bg-white/50 backdrop-blur text-center py-20 rounded-2xl">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-purple-100">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="font-bold text-lg text-slate-800">Sẵn sàng truy xuất nhật ký</h3>
              <p className="text-slate-400 text-sm font-medium">
                Vui lòng nhập mã hồ sơ khám bệnh ở thanh công cụ phía trên và nhấn nút <b>Tra cứu hồ sơ</b> để truy xuất dữ liệu audit log.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        // Loading state
        <div className="space-y-6">
          <Card className="animate-pulse shadow-sm h-24 bg-white/80 rounded-2xl border"></Card>
          <div className="space-y-4">
            <div className="h-36 bg-white/80 rounded-2xl border animate-pulse"></div>
            <div className="h-36 bg-white/80 rounded-2xl border animate-pulse"></div>
          </div>
        </div>
      ) : isError ? (
        // Error state
        <Card className="border-red-200 bg-red-50/20 p-8 text-center rounded-2xl shadow-sm">
          <CardContent className="space-y-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-full w-fit mx-auto">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-red-800">Không thể kết nối cơ sở dữ liệu</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">
              Không thể tải thông tin audit log cho hồ sơ <b>{activeMaHoSo}</b>. 
              Vui lòng kiểm tra lại mã hồ sơ hoặc liên hệ Admin hệ thống Oracle DB.
            </p>
            <Button variant="outline" onClick={() => refetch()} className="mt-2 border-red-200 text-red-700 hover:bg-red-50/50 rounded-xl h-10 px-5">
              Thử kết nối lại
            </Button>
          </CardContent>
        </Card>
      ) : !auditLogs || auditLogs.length === 0 ? (
        // Empty state
        <Card className="border-dashed border-2 border-slate-200 bg-white/50 backdrop-blur text-center py-20 rounded-2xl">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="font-bold text-lg text-slate-800">Hồ sơ chưa có thay đổi nào</h3>
              <p className="text-slate-400 text-sm font-medium">
                Mã hồ sơ khám bệnh <b>{activeMaHoSo}</b> chưa từng được chỉnh sửa sau khi tạo, hoặc không tồn tại trên hệ thống.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Success state
        <div className="space-y-6">
          {/* Patient Overview Card */}
          <Card className="shadow-md bg-gradient-to-r from-purple-50/30 via-white to-white border-l-4 border-l-purple-600 rounded-2xl">
            <CardContent className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1">
                <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Thông tin hồ sơ thay đổi</p>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {patientName || "Bệnh nhân Vision Care"}
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100 font-bold ml-2">
                    {activeMaHoSo}
                  </Badge>
                </h2>
              </div>
              <div className="flex gap-5 text-sm font-semibold text-slate-500 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Tổng số lượt cập nhật: <b className="text-purple-600">{auditLogs.length}</b></span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Tabs (Timeline vs Table) */}
          <Tabs defaultValue="timeline" className="w-full">
            <div className="flex justify-between items-center border-b pb-3 mb-6">
              <TabsList className="bg-slate-100 p-1 rounded-xl">
                <TabsTrigger value="timeline" className="data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-lg font-bold text-xs px-4">
                  Dòng thời gian
                </TabsTrigger>
                <TabsTrigger value="table" className="data-[state=active]:bg-white data-[state=active]:text-purple-700 rounded-lg font-bold text-xs px-4">
                  Bảng chi tiết
                </TabsTrigger>
              </TabsList>
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Mới nhất hiển thị trước
              </span>
            </div>

            {/* TIMELINE TAB */}
            <TabsContent value="timeline" className="space-y-6 pt-2">
              <div className="relative border-l-2 border-purple-200 ml-4 md:ml-6 pl-6 md:pl-8 space-y-8 pb-4">
                {auditLogs.map((log, index) => (
                  <div key={index} className="relative group">
                    {/* Timeline Node Icon */}
                    <div className="absolute -left-[35px] md:-left-[43px] top-1 bg-white border-2 border-purple-600 rounded-xl w-6.5 h-6.5 flex items-center justify-center shadow-md z-10 transition-all duration-300 group-hover:bg-purple-600 group-hover:scale-110">
                      <Clock className="w-3.5 h-3.5 text-purple-600 transition-colors group-hover:text-white" />
                    </div>

                    {/* Timeline Card */}
                    <Card className="shadow-sm border-slate-200/80 bg-white hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-0.5 transition-all duration-300 rounded-2xl overflow-hidden">
                      {/* Timeline Card Header */}
                      <div className="bg-slate-50/80 border-b border-slate-200/60 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5 text-slate-700 font-bold bg-slate-200/60 border px-2.5 py-1 rounded-lg">
                            <User className="w-4 h-4 text-slate-500" />
                            {log.nguoiThayDoi}
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-500 font-semibold">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {formatDate(log.thoiGianThayDoi)}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold tracking-wider bg-purple-50/40 text-purple-700 border-purple-200 uppercase rounded-md px-2 py-0.5">
                          SYS_AUDIT
                        </Badge>
                      </div>

                      {/* Timeline Comparison Body */}
                      <CardContent className="p-5 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Old Conclusion */}
                          <div className="bg-rose-50/30 border border-rose-100 rounded-2xl p-4 space-y-2.5">
                            <span className="inline-block text-[10px] font-bold text-rose-700 uppercase tracking-widest px-2 py-0.5 bg-rose-100/70 border border-rose-200/50 rounded-md">
                              Kết luận cũ
                            </span>
                            <p className="text-sm font-medium text-slate-600 italic leading-relaxed min-h-[44px]">
                              {log.ketLuanCu || "(Trống / Chưa ghi nhận kết luận ban đầu)"}
                            </p>
                          </div>

                          {/* New Conclusion */}
                          <div className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-4 space-y-2.5">
                            <span className="inline-block text-[10px] font-bold text-emerald-700 uppercase tracking-widest px-2 py-0.5 bg-emerald-100/70 border border-emerald-200/50 rounded-md">
                              Kết luận mới
                            </span>
                            <p className="text-sm font-bold text-slate-800 leading-relaxed min-h-[44px]">
                              {log.ketLuanMoi || "(Trống / Bị xóa hoặc sửa bỏ)"}
                            </p>
                          </div>
                        </div>

                        {/* Reason field */}
                        {log.lyDoThayDoi && (
                          <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
                            <FileText className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lý do điều chỉnh</p>
                              <p className="text-sm text-slate-700 font-bold mt-1 leading-relaxed">{log.lyDoThayDoi}</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TABLE TAB */}
            <TabsContent value="table" className="pt-2">
              <Card className="shadow-sm border-slate-200 rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow className="border-b border-slate-200">
                          <TableHead className="w-[180px] font-bold text-slate-600 pl-6 py-4.5">Thời gian cập nhật</TableHead>
                          <TableHead className="w-[150px] font-bold text-slate-600 py-4.5">Tài khoản sửa</TableHead>
                          <TableHead className="font-bold text-slate-600 py-4.5">Kết luận cũ</TableHead>
                          <TableHead className="font-bold text-slate-600 py-4.5">Kết luận mới</TableHead>
                          <TableHead className="font-bold text-slate-600 pr-6 py-4.5">Lý do thay đổi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-slate-100">
                        {auditLogs.map((log, index) => (
                          <TableRow key={index} className="hover:bg-slate-50/30 transition-colors">
                            <td className="font-semibold text-slate-500 pl-6 py-4 text-xs">
                              {formatDate(log.thoiGianThayDoi)}
                            </td>
                            <td>
                              <Badge variant="outline" className="bg-slate-100/80 border-slate-200 font-bold text-slate-700 px-2.5 py-1 rounded-lg">
                                {log.nguoiThayDoi}
                              </Badge>
                            </td>
                            <td className="max-w-[200px] truncate text-slate-500 text-xs italic py-4">
                              {log.ketLuanCu || "Trống"}
                            </td>
                            <td className="max-w-[200px] truncate font-bold text-slate-800 text-sm py-4">
                              {log.ketLuanMoi || "Trống"}
                            </td>
                            <td className="text-slate-600 max-w-[220px] truncate pr-6 text-xs font-bold py-4">
                              {log.lyDoThayDoi || "Không cung cấp lý do"}
                            </td>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

export default function AuditPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-purple-600 font-medium">
        Đang tải trang nhật ký...
      </div>
    }>
      <AuditContent />
    </Suspense>
  );
}
