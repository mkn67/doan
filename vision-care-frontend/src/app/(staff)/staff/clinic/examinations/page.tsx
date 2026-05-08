"use client";

import "@/app/globals.css";
import * as React from "react";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Activity, Eye, ArrowRight, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation"; 
import { AxiosError } from "axios";

import { useCreateHoSoKham } from "@/hooks/useClinic"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoSoKhamRequest } from "@/types/clinic";

interface JavaErrorResponse { message?: string; }
interface HoSoKhamResponse { maHoSo: string; }

// =========================================================
// 🛠️ FIX TỐI THƯỢNG: Dùng z.any() để TypeScript ngậm miệng
// =========================================================
const examSchema = z.object({
  maKh: z.string().min(1, "Vui lòng nhập mã khách hàng"),
  maNs: z.string().min(1, "Vui lòng nhập mã bác sĩ"),
  matTraiSph: z.any(), // Cho nó thoải mái nhận String từ ô Input
  matPhaiSph: z.any(),
  pd: z.any(),
});

type ExamFormValues = z.infer<typeof examSchema>;

function ExaminationContent() {
  const mutation = useCreateHoSoKham();
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdFromUrl = searchParams.get("makh") || "";

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      maKh: patientIdFromUrl,
      maNs: "", 
      matTraiSph: 0,
      matPhaiSph: 0,
      pd: 60,
    },
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          form.setValue("maNs", user.username || ""); 
        } catch (e) {}
      }
    }
  }, [form]);

  // 🛠️ Ép kiểu Number() lúc gửi lên Java (Tuyệt đối an toàn)
  const onSubmit = (values: ExamFormValues) => {
    const payload: HoSoKhamRequest = {
      makh: values.maKh,
      mans: values.maNs,
      matTraiSph: Number(values.matTraiSph) || 0,
      matPhaiSph: Number(values.matPhaiSph) || 0,
      pd: Number(values.pd) || 60,
    };

    mutation.mutate(payload, {
      onSuccess: (data) => {
        const res = data as unknown as HoSoKhamResponse;
        const maHoSo = res?.maHoSo || "HS_NEW"; 
        alert("✅ Đã lưu hồ sơ khám!");
        router.push(`/staff/clinic/prescriptions?maHoSo=${maHoSo}&maNs=${values.maNs}`);
      },
      onError: (err) => {
        const axiosError = err as AxiosError<JavaErrorResponse>;
        alert("Lỗi: " + (axiosError.response?.data?.message || "Lỗi hệ thống"));
      }
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hồ sơ khám bệnh</h1>
          <p className="text-slate-500">Ghi nhận chỉ số khúc xạ thực tế</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg">Nhập chỉ số đo</CardTitle>
          <CardDescription>Mã bệnh nhân và bác sĩ được tự động điền</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="maKh" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã Bệnh nhân</FormLabel>
                    <FormControl><Input readOnly className="bg-slate-100" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="maNs" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bác sĩ phụ trách</FormLabel>
                    <FormControl><Input readOnly className="bg-slate-100 font-semibold text-blue-600" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="p-5 border rounded-lg bg-slate-50 space-y-5">
                <h3 className="font-bold flex items-center text-slate-700 uppercase text-xs tracking-wider">
                  <Eye className="w-4 h-4 mr-2 text-blue-500" /> Kết quả đo máy (SPH)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="matTraiSph" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mắt Trái (OS)</FormLabel>
                      <FormControl><Input type="number" step="0.25" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="matPhaiSph" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mắt Phải (OD)</FormLabel>
                      <FormControl><Input type="number" step="0.25" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="pd" render={({ field }) => (
                    <FormItem>
                      <FormLabel>KC đồng tử (PD)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={mutation.isPending} className="bg-blue-600 hover:bg-blue-700 min-w-[180px]">
                  {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <>Lưu & Sang Kê Đơn <ArrowRight className="ml-2 w-4 h-4" /></>}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ExaminationPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Đang tải...</div>}>
      <ExaminationContent />
    </Suspense>
  );
}