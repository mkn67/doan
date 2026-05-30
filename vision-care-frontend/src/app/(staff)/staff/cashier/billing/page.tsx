"use client";

import React, { useState, useEffect } from "react";
import { Receipt, FilePlus, Loader2, Info, ArrowLeft, ShieldAlert, User, Check, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { useCreateHoaDonJson, usePendingInvoices } from "@/hooks/useBilling"; 
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { TaoHoaDonJsonRequest } from "@/types/billing";

const billingSchema = z.object({
  maKh: z.string().min(1, "Vui lòng nhập mã khách hàng"),
  maHoSo: z.string().optional(), 
  maDon: z.string().optional(),
});

type BillingFormValues = z.infer<typeof billingSchema>;

export default function BillingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const createMutation = useCreateHoaDonJson();
  const { data: pendingInvoices, isLoading: isPendingLoading } = usePendingInvoices();
  const [isMounted, setIsMounted] = useState(false);
  const [maNs, setMaNs] = useState("");

  const ALLOWED_ROLES = ["ROLE_THU_NGAN", "NH02", "ROLE_ADMIN", "NH04"];
  const hasAccess = () => {
    if (!user) return false;
    const userRoles = user?.roles || [];
    const userGroup = user?.maNhom ? user.maNhom : null;
    return ALLOWED_ROLES.some(role => userRoles.includes(role) || role === userGroup);
  };

  const form = useForm<BillingFormValues>({
    resolver: zodResolver(billingSchema),
    defaultValues: { 
      maKh: "", 
      maHoSo: "", 
      maDon: "" 
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setMaNs(user.maNs || "NS000"); 
        } catch (error) {
          console.error("Lỗi đọc dữ liệu người dùng:", error);
        }
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  const onSubmit = (values: BillingFormValues) => {
    const payload: TaoHoaDonJsonRequest = {
      maKh: values.maKh,
      maNs: maNs,
      maHoso: values.maHoSo || undefined,
      maDon: values.maDon || undefined,
      jsonSp: "",
      jsonDv: "",
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        alert("✅ Lập hóa đơn thành công!");
        form.reset();
        router.push("/staff/cashier/payments");
      },
      onError: (err: any) => {
        const errorMsg = err?.response?.data || err?.message || "Có lỗi xảy ra";
        alert(`❌ Có lỗi xảy ra khi tạo hóa đơn: ${errorMsg}`);
      },
    });
  };

  if (!isMounted || loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-blue-600 font-medium">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  if (!hasAccess()) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 m-6 p-8 text-center">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">Truy Cập Bị Từ Chối</h2>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Tài khoản của bạn không có nghiệp vụ Thu ngân. Vui lòng quay lại!
        </p>
        <Button onClick={() => router.back()} className="mt-6 bg-slate-800 hover:bg-slate-900 rounded-xl px-5 h-11 font-bold">
          Quay lại trang trước
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/staff/cashier")}
          className="rounded-full hover:bg-slate-200"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </Button>
        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shadow-sm">
          <FilePlus className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lập Hóa Đơn (Billing)</h1>
          <p className="text-slate-500 mt-1">Khởi tạo hóa đơn mới từ hồ sơ khám và đơn thuốc của khách hàng.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-lg">Thông tin khởi tạo</CardTitle>
            <CardDescription>Nhập thông tin bệnh nhân để hệ thống tự động tổng hợp chi phí.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <FormField control={form.control} name="maKh" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã Khách Hàng <span className="text-red-500">*</span></FormLabel>
                      <FormControl><Input placeholder="VD: KH001" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="space-y-2 mt-1">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Thu ngân lập phiếu
                    </label>
                    <Input value={maNs} disabled className="bg-slate-100 font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormField control={form.control} name="maHoSo" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã Hồ sơ khám (Tùy chọn)</FormLabel>
                      <FormControl><Input placeholder="VD: HS_S01" {...field} value={field.value ?? ""} /></FormControl>
                      <FormDescription className="text-xs">Dùng để tính tiền dịch vụ khám</FormDescription>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="maDon" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã Đơn thuốc/kính (Tùy chọn)</FormLabel>
                      <FormControl><Input placeholder="VD: KD_S01" {...field} value={field.value ?? ""} /></FormControl>
                      <FormDescription className="text-xs">Dùng để tính tiền sản phẩm thuốc & kính mắt</FormDescription>
                    </FormItem>
                  )} />
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-11 px-8" disabled={createMutation.isPending}>
                    {createMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Receipt className="w-5 h-5 mr-2" />}
                    Lưu Hóa Đơn & Chuyển Thanh Toán
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 flex flex-col h-full bg-white">
          <CardHeader className="bg-slate-50/50 border-b py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Danh sách chờ lập hóa đơn
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Click chọn để tự động điền thông tin khám / đơn thuốc
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3 max-h-[450px] overflow-y-auto">
            {isPendingLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
                <span className="text-sm">Đang tải danh sách chờ...</span>
              </div>
            ) : !pendingInvoices || pendingInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 border border-dashed rounded-xl p-4 bg-slate-50">
                <Info className="w-8 h-8 mb-2 text-slate-300" />
                <span className="text-sm font-medium">Hàng đợi trống</span>
                <span className="text-xs text-center text-slate-400 mt-1">Không có bệnh nhân nào cần lập hóa đơn hiện tại.</span>
              </div>
            ) : (
              pendingInvoices.map((item: any, idx: number) => (
                <div 
                  key={idx} 
                  className="p-3 border border-slate-100 rounded-xl hover:border-blue-300 hover:bg-blue-50/20 transition-all duration-200 cursor-pointer relative group flex flex-col gap-1.5 shadow-sm bg-white"
                  onClick={() => {
                    form.setValue("maKh", item.maKh);
                    form.setValue("maHoSo", item.maHoSo || "");
                    form.setValue("maDon", item.maDon || "");
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {item.tenKhachHang}
                      </div>
                      {item.sdtKhachHang && (
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          SĐT: {item.sdtKhachHang}
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      item.loaiKham.includes("&")
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : item.loaiKham.includes("Khám")
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      {item.loaiKham}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {item.maHoSo && (
                      <span className="text-[10px] font-mono bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-100">
                        HS: {item.maHoSo}
                      </span>
                    )}
                    {item.maDon && (
                      <span className="text-[10px] font-mono bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-100">
                        Đơn: {item.maDon}
                      </span>
                    )}
                  </div>

                  <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-2 py-0.5 flex items-center gap-1">
                      Chọn <Check className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}