"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Stethoscope } from "lucide-react";

import { clinicApi } from "@/lib/api/clinic.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";

const prescriptionSchema = z.object({
  maHoSo: z.string().min(1, "Vui lòng nhập mã hồ sơ khám"),
  maNs: z.string().min(1, "Vui lòng nhập mã bác sĩ kê đơn"),
  danhSachKeDon: z.array(
    z.object({
      maSp: z.string().min(1, "Nhập mã thuốc/kính"),
      soLuong: z.coerce.number().min(1, "Số lượng phải >= 1"),
    })
  ).min(1, "Đơn thuốc phải có ít nhất 1 sản phẩm"),
});

export default function PrescriptionPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof prescriptionSchema>>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      maHoSo: "",
      maNs: "",
      danhSachKeDon: [{ maSp: "", soLuong: 1 }], // Mặc định có sẵn 1 dòng trống
    },
  });

  // useFieldArray giúp quản lý mảng động cực ngon
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "danhSachKeDon",
  });

  async function onSubmit(values: z.infer<typeof prescriptionSchema>) {
    setIsSubmitting(true);
    try {
      await clinicApi.createPhieuKeDon(values);
      alert("Tạo đơn thuốc thành công!");
      form.reset();
    } catch (error) {
      console.error("Lỗi tạo đơn:", error);
      alert("Có lỗi xảy ra khi tạo đơn!");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
          <Stethoscope className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kê đơn thuốc / Cắt kính</h1>
          <p className="text-slate-500">Tạo phiếu kê đơn dựa trên hồ sơ khám bệnh</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg">Thông tin phiếu xuất</CardTitle>
          <CardDescription>Điền thông tin hồ sơ và danh sách vật tư y tế</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="maHoSo" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã Hồ sơ khám</FormLabel>
                    <FormControl><Input placeholder="VD: HS001" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="maNs" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã Bác sĩ</FormLabel>
                    <FormControl><Input placeholder="VD: NS001" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Danh sách kê đơn động */}
              <div className="space-y-4 border rounded-md p-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-700">Chi tiết đơn hàng</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => append({ maSp: "", soLuong: 1 })}
                    className="h-8"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Thêm sản phẩm
                  </Button>
                </div>

                {fields.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-3 bg-white p-3 rounded border shadow-sm">
                    <div className="flex-1">
                      <FormField control={form.control} name={`danhSachKeDon.${index}.maSp`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Mã Sản phẩm / Thuốc</FormLabel>
                          <FormControl><Input placeholder="VD: SP001" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="w-32">
                      <FormField control={form.control} name={`danhSachKeDon.${index}.soLuong`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Số lượng</FormLabel>
                          <FormControl><Input type="number" min="1" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => remove(index)}
                      className="mt-6 text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
                      disabled={fields.length === 1} // Không cho xóa nếu chỉ còn 1 dòng
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
                {form.formState.errors.danhSachKeDon?.root && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.danhSachKeDon.root.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                  {isSubmitting ? "Đang xử lý..." : "Lưu & Xuất phiếu"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}