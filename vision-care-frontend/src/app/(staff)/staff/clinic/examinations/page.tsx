"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Activity, Eye } from "lucide-react";

import { useCreateHoSoKham } from "@/hooks/useClinic"; // Hook của ông giáo
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";

// 1. Zod Schema kiểm tra dữ liệu đo thị lực
const examSchema = z.object({
  makh: z.string().min(1, "Vui lòng nhập mã khách hàng"),
  mans: z.string().min(1, "Vui lòng nhập mã bác sĩ"),
  matTraiSph: z.coerce.number(),
  matPhaiSph: z.coerce.number(),
  pd: z.coerce.number().min(0, "PD không hợp lệ"),
});

export default function ExaminationPage() {
  const mutation = useCreateHoSoKham();

  const form = useForm<z.infer<typeof examSchema>>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      makh: "",
      mans: "",
      matTraiSph: 0,
      matPhaiSph: 0,
      pd: 60, // Giá trị PD trung bình mặc định
    },
  });

  function onSubmit(values: z.infer<typeof examSchema>) {
    mutation.mutate(values, {
      onSuccess: () => {
        alert("Lưu hồ sơ khám thành công!");
        form.reset();
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
              
              {/* Thông tin hành chính */}
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="makh" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã Bệnh nhân (Khách hàng)</FormLabel>
                    <FormControl><Input placeholder="VD: KH001" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="mans" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã Bác sĩ phụ trách</FormLabel>
                    <FormControl><Input placeholder="VD: NS001" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Chỉ số Y khoa */}
              <div className="p-4 border rounded-md bg-slate-50 space-y-4">
                <h3 className="font-semibold flex items-center text-slate-700">
                  <Eye className="w-4 h-4 mr-2" /> Kết quả khúc xạ (SPH)
                </h3>
                <div className="grid grid-cols-3 gap-4">
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
                      <FormLabel>Khoảng cách đồng tử (PD)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={mutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                  {mutation.isPending ? "Đang lưu..." : "Lưu hồ sơ khám"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}