"use client";
import "@/app/globals.css";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Activity, Eye, ArrowRight } from "lucide-react";
// THÊM IMPORT ĐỂ CHUYỂN TRANG VÀ LẤY URL
import { useSearchParams, useRouter } from "next/navigation"; 

import { useCreateHoSoKham } from "@/hooks/useClinic"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";

// Schema không lỗi TypeScript
const examSchema = z.object({
  makh: z.string().min(1, "Vui lòng nhập mã khách hàng"),
  mans: z.string().min(1, "Vui lòng nhập mã bác sĩ"),
  matTraiSph: z.number({ message: "Phải là số" }),
  matPhaiSph: z.number({ message: "Phải là số" }),
  pd: z.number({ message: "Phải là số" }).min(0, "PD không hợp lệ"),
});

type ExamFormValues = z.infer<typeof examSchema>;

export default function ExaminationPage() {
  const mutation = useCreateHoSoKham();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. LẤY MÃ KHÁCH HÀNG TỪ URL (nếu Bác sĩ bấm từ trang Lịch Hẹn sang)
  const patientIdFromUrl = searchParams.get("makh") || "";

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      makh: patientIdFromUrl, // Tự động điền
      mans: "", 
      matTraiSph: 0,
      matPhaiSph: 0,
      pd: 60,
    },
  });

  // 2. TỰ ĐỘNG LẤY MÃ BÁC SĨ (Từ LocalStorage lúc đăng nhập)
  React.useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      // Điền username của bác sĩ (VD: thuDiem) vào form
      form.setValue("mans", user.username); 
    }
  }, [form]);

  function onSubmit(values: ExamFormValues) {
    mutation.mutate(values, {
      onSuccess: (data) => {
        // Giả sử API trả về mã hồ sơ vừa tạo, nếu không có thì set tạm để test
        const maHoSo = data?.maHoSo || "HS_NEW_123"; 
        
        alert("Khám xong! Chuyển sang kê đơn...");
        
        // 3. LƯU XONG TỰ ĐỘNG NHẢY SANG TRANG KÊ ĐƠN
        router.push(`/staff/clinic/prescriptions?maHoSo=${maHoSo}&mans=${values.mans}`);
      }
    });
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hồ sơ khám bệnh</h1>
          <p className="text-slate-500">Đo thị lực và ghi nhận chỉ số khúc xạ</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg">Nhập chỉ số đo</CardTitle>
          <CardDescription>Nhập mã bệnh nhân và kết quả đo khúc xạ máy</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="makh" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã Bệnh nhân</FormLabel>
                    {/* Thêm readOnly và tô xám ô này */}
                    <FormControl><Input readOnly className="bg-slate-100" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="mans" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã Bác sĩ phụ trách</FormLabel>
                    {/* Thêm readOnly và tô xám ô này */}
                    <FormControl><Input readOnly className="bg-slate-100 font-semibold text-blue-600" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* KHU VỰC NHẬP SỐ ĐO GIỮ NGUYÊN NHƯ CỦA ÔNG GIÁO */}
              <div className="p-4 border rounded-md bg-slate-50 space-y-4">
                <h3 className="font-semibold flex items-center text-slate-700">
                  <Eye className="w-4 h-4 mr-2" /> Kết quả khúc xạ (SPH)
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="matTraiSph" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mắt Trái (OS)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.25" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="matPhaiSph" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mắt Phải (OD)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.25" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="pd" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Khoảng cách đồng tử (PD)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={mutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                  {mutation.isPending ? "Đang lưu..." : (
                    <>Lưu & Sang Kê Đơn <ArrowRight className="ml-2 w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}