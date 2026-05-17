"use client";

import React, { useState, useEffect } from "react";
import { Receipt, FilePlus, Loader2, Info, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { useCreateHoaDon } from "@/hooks/useBilling"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { HoaDonRequestDTO } from "@/types/billing";

// 🔥 Sửa maHoso thành maHoSo (S viết hoa) cho khớp 100% với Backend DTO
const billingSchema = z.object({
  maKh: z.string().min(1, "Vui lòng nhập mã khách hàng"),
  maHoSo: z.string().optional(), 
  maDon: z.string().optional(),
});

type BillingFormValues = z.infer<typeof billingSchema>;

export default function BillingPage() {
  const router = useRouter();
  const createMutation = useCreateHoaDon();
  const [isMounted, setIsMounted] = useState(false);
  const [maNs, setMaNs] = useState("");

  const form = useForm<BillingFormValues>({
    resolver: zodResolver(billingSchema),
    defaultValues: { maKh: "", maHoSo: "", maDon: "" },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setMaNs(user.username || "NS000"); 
        } catch (error) {
          console.error("Lỗi đọc dữ liệu người dùng:", error);
        }
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  const onSubmit = (values: BillingFormValues) => {
    const payload: HoaDonRequestDTO = {
      maKh: values.maKh,
      maNs: maNs,
      maHoSo: values.maHoSo || undefined, 
      dsSanPhams: [], // Cần logic thêm sản phẩm từ maDon hoặc UI
      dsDichVus: [],  // Cần logic thêm dịch vụ từ maHoSo hoặc UI
      tongTienDuKien: 0,
      ghiChu: values.maDon ? `Tạo từ đơn: ${values.maDon}` : "",
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        alert("✅ Lập hóa đơn thành công!");
        form.reset();
        router.push("/staff/cashier/payments");
      },
      onError: () => alert("❌ Có lỗi xảy ra khi tạo hóa đơn!"),
    });
  };

  if (!isMounted) return null;

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
                      <FormControl><Input placeholder="VD: HS_S01" {...field} /></FormControl>
                      <FormDescription className="text-xs">Dùng để tính tiền dịch vụ khám</FormDescription>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="maDon" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã Đơn thuốc/kính (Tùy chọn)</FormLabel>
                      <FormControl><Input placeholder="VD: KD_S01" {...field} /></FormControl>
                      <FormDescription className="text-xs">Dùng để tính tiền sản phẩm</FormDescription>
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

        <Card className="bg-blue-50/50 border-blue-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-blue-800 flex items-center gap-2">
              <Info className="w-5 h-5" /> Hướng dẫn nghiệp vụ
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-700 space-y-3 leading-relaxed">
            <p><strong>Bước 1:</strong> Hỏi Mã khách hàng hoặc Số điện thoại để tra cứu.</p>
            <p><strong>Bước 2:</strong> Nhập <b>Mã Hồ Sơ</b> nếu khách có thực hiện các dịch vụ như Đo khúc xạ, Soi đáy mắt...</p>
            <p><strong>Bước 3:</strong> Nhập <b>Mã Đơn Kính/Thuốc</b> nếu khách có mua gọng, tròng hoặc thuốc nhỏ mắt.</p>
            <p className="mt-4 p-3 bg-white rounded-lg border border-blue-100 text-slate-600">
              💡 <i>Mẹo: Hệ thống sẽ tự động móc nối các mã này để tính ra Tổng tiền cuối cùng.</i>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}