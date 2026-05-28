"use client";

import React, { useEffect, useState } from "react";
import { User, Phone, MapPin, Shield, IdCard, Loader2, Sparkles } from "lucide-react";
import { useGetProfile, useUpdateProfile } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { data: profile, isLoading, refetch } = useGetProfile();
  const updateMutation = useUpdateProfile();

  const [hoTen, setHoTen] = useState("");
  const [sdt, setSdt] = useState("");
  const [diaChi, setDiaChi] = useState("");

  useEffect(() => {
    if (profile) {
      setHoTen(profile.hoTen || "");
      setSdt(profile.sdt || "");
      setDiaChi(profile.diaChi || "");
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoTen.trim() || !sdt.trim()) {
      alert("Họ tên và Số điện thoại không được để trống!");
      return;
    }
    updateMutation.mutate(
      { hoTen, sdt, diaChi },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  const getRoleBadgeLabel = (rolesList?: string[]) => {
    if (!rolesList || rolesList.length === 0) return "Nhân viên";
    const primary = rolesList[0];
    if (primary.includes("ADMIN")) return "Quản trị viên";
    if (primary.includes("BAC_SI")) return "Bác sĩ chuyên khoa";
    if (primary.includes("LE_TAN")) return "Lễ tân hành chính";
    if (primary.includes("THU_NGAN")) return "Thu ngân tài chính";
    if (primary.includes("THU_KHO")) return "Thủ kho vật tư";
    if (primary.includes("KY_THUAT")) return "Kỹ thuật viên mài lắp";
    return "Nhân sự";
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-blue-600 font-medium">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        Đang tải thông tin cá nhân...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            {profile?.hoTen ? profile.hoTen.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Thông Tin Cá Nhân</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Quản lý hồ sơ và cập nhật thông tin liên lạc của bạn trên hệ thống.
            </p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold rounded-full">
          {getRoleBadgeLabel(profile?.roles)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: STATIC INFO ACCORDION */}
        <Card className="shadow-sm border-slate-200 h-fit bg-slate-50/50">
          <CardHeader>
            <CardTitle className="text-base text-slate-800">Thông tin tài khoản</CardTitle>
            <CardDescription>Chi tiết tài khoản phân quyền</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
              <IdCard className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Mã Nhân Sự / Khách</p>
                <p className="text-sm font-bold text-slate-800">{profile?.actorId || "Chưa cấp"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
              <User className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Tên đăng nhập (Email)</p>
                <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]" title={profile?.username}>
                  {profile?.username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
              <Shield className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Quyền truy cập</p>
                <p className="text-xs font-semibold text-indigo-600 truncate max-w-[200px]">
                  {profile?.roles?.join(", ") || "ROLE_STAFF"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN: UPDATE FORM */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-lg">Chỉnh sửa hồ sơ cá nhân</CardTitle>
            <CardDescription>Cập nhật thông tin thực tế để đồng bộ danh bạ.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Họ tên */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" /> Họ và tên <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={hoTen}
                  onChange={(e) => setHoTen(e.target.value)}
                  className="h-11 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
                  placeholder="Nhập họ và tên..."
                />
              </div>

              {/* SĐT */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" /> Số điện thoại <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  required
                  value={sdt}
                  onChange={(e) => setSdt(e.target.value)}
                  className="h-11 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
                  placeholder="Nhập số điện thoại..."
                />
              </div>

              {/* Địa chỉ */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" /> Địa chỉ liên hệ
                </label>
                <Input
                  type="text"
                  value={diaChi}
                  onChange={(e) => setDiaChi(e.target.value)}
                  className="h-11 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
                  placeholder="Nhập địa chỉ của bạn..."
                />
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 h-11 px-8 rounded-xl shadow-md shadow-indigo-500/10 text-white font-bold transition-all hover:scale-[1.02]"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                  )}
                  Lưu thay đổi hồ sơ
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
