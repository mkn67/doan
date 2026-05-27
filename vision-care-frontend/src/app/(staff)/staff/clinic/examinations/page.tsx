"use client";

import "@/app/globals.css";
import * as React from "react";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Activity, 
  Eye, 
  ArrowRight, 
  Loader2, 
  Upload, 
  Sparkles, 
  FileText 
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation"; 
import { AxiosError } from "axios";

import { useCreateHoSoKham } from "@/hooks/useClinic"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoSoKhamRequest } from "@/types/clinic";
import { toast } from "sonner";

interface JavaErrorResponse { message?: string; }
interface HoSoKhamResponse { maHoSo: string; }

const examSchema = z.object({
  maKh: z.string().min(1, "Vui lòng nhập mã khách hàng"),
  maNs: z.string().min(1, "Vui lòng nhập mã bác sĩ"),
  matTraiSph: z.any(),
  matTraiCyl: z.any().optional(),
  matTraiAx: z.any().optional(),
  matPhaiSph: z.any(),
  matPhaiCyl: z.any().optional(),
  matPhaiAx: z.any().optional(),
  pd: z.any(),
  ketluan: z.string().min(1, "Vui lòng điền kết luận của bác sĩ"),
});

type ExamFormValues = z.infer<typeof examSchema>;

// =========================================================
// SVG EYE MAP COMPONENT
// =========================================================
function EyeRefractionMap({ os, od, pd }: { os: number; od: number; pd: number }) {
  const getEyeGradient = (val: number) => {
    if (val === 0) return { from: "#059669", to: "#10b981" }; // Emerald (Normal)
    if (val < 0) {
      // Myopia (Sky blue to Deep Indigo/Violet)
      return val > -3 
        ? { from: "#38bdf8", to: "#0284c7" } 
        : { from: "#818cf8", to: "#4f46e5" }; 
    } else {
      // Hyperopia (Amber to Rose Red)
      return val < 3 
        ? { from: "#fbbf24", to: "#d97706" } 
        : { from: "#f87171", to: "#dc2626" }; 
    }
  };

  const leftGrad = getEyeGradient(os);
  const rightGrad = getEyeGradient(od);

  const getPupilRadius = (val: number) => {
    const base = 15;
    const change = Math.max(-6, Math.min(6, val));
    return base + change;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner text-white h-full min-h-[350px] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" /> Sơ đồ Khúc xạ Nhãn Khoa
      </h3>
      
      <div className="flex items-center gap-10 w-full justify-center">
        {/* OD - Mắt Phải */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mắt Phải (OD)</span>
          <svg className="w-28 h-28 filter drop-shadow-xl" viewBox="0 0 100 100">
            <defs>
              <radialGradient id="grad-od" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={rightGrad.from} />
                <stop offset="100%" stopColor={rightGrad.to} />
              </radialGradient>
              <radialGradient id="sclera-grad" cx="50%" cy="50%" r="50%">
                <stop offset="70%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </radialGradient>
            </defs>
            <ellipse cx="50" cy="50" rx="46" ry="30" fill="url(#sclera-grad)" stroke="#475569" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="22" fill="url(#grad-od)" stroke="#334155" strokeWidth="1" />
            <circle cx="50" cy="50" r={getPupilRadius(od)} fill="#090d16" />
            <circle cx="43" cy="43" r="3" fill="#ffffff" opacity="0.8" />
            <circle cx="46" cy="46" r="1.5" fill="#ffffff" opacity="0.6" />
          </svg>
          <div className="text-center mt-1">
            <span className={`text-base font-black font-mono px-3 py-1 rounded-lg ${
              od === 0 ? "text-emerald-400 bg-emerald-950/40" : od < 0 ? "text-sky-400 bg-sky-950/40" : "text-amber-400 bg-amber-950/40"
            }`}>
              {od > 0 ? `+${Number(od).toFixed(2)}` : Number(od).toFixed(2)} D
            </span>
          </div>
        </div>

        {/* OS - Mắt Trái */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mắt Trái (OS)</span>
          <svg className="w-28 h-28 filter drop-shadow-xl" viewBox="0 0 100 100">
            <defs>
              <radialGradient id="grad-os" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={leftGrad.from} />
                <stop offset="100%" stopColor={leftGrad.to} />
              </radialGradient>
            </defs>
            <ellipse cx="50" cy="50" rx="46" ry="30" fill="url(#sclera-grad)" stroke="#475569" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="22" fill="url(#grad-os)" stroke="#334155" strokeWidth="1" />
            <circle cx="50" cy="50" r={getPupilRadius(leftGrad.from === "#059669" ? 0 : os)} fill="#090d16" />
            <circle cx="43" cy="43" r="3" fill="#ffffff" opacity="0.8" />
            <circle cx="46" cy="46" r="1.5" fill="#ffffff" opacity="0.6" />
          </svg>
          <div className="text-center mt-1">
            <span className={`text-base font-black font-mono px-3 py-1 rounded-lg ${
              os === 0 ? "text-emerald-400 bg-emerald-950/40" : os < 0 ? "text-sky-400 bg-sky-950/40" : "text-amber-400 bg-amber-950/40"
            }`}>
              {os > 0 ? `+${Number(os).toFixed(2)}` : Number(os).toFixed(2)} D
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-800 w-full flex items-center justify-between text-xs text-slate-400 font-semibold px-4">
        <span>Khoảng cách đồng tử (PD):</span>
        <span className="text-emerald-400 text-sm font-black font-mono">{pd} mm</span>
      </div>
    </div>
  );
}

// =========================================================
// MAIN EXAMINATION CONTENT
// =========================================================
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
      matTraiCyl: 0,
      matTraiAx: 0,
      matPhaiSph: 0,
      matPhaiCyl: 0,
      matPhaiAx: 0,
      pd: 60,
      ketluan: "Thị lực ổn định, khúc xạ bình thường",
    },
  });

  const matTraiSph = form.watch("matTraiSph") || 0;
  const matPhaiSph = form.watch("matPhaiSph") || 0;
  const pd = form.watch("pd") || 60;

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

  // Auto-refractor file reader
  const handleAutoRefractorFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      
      let odSph = 0; let odCyl = 0; let odAx = 0;
      let osSph = 0; let osCyl = 0; let osAx = 0;
      let pdVal = 60;

      // Regex parse standard values from file
      const odMatch = text.match(/OD:?\s*SPH?\s*([+-]?\d+\.?\d*)/i) || text.match(/OD\s*([+-]?\d+\.?\d*)/i);
      const osMatch = text.match(/OS:?\s*SPH?\s*([+-]?\d+\.?\d*)/i) || text.match(/OS\s*([+-]?\d+\.?\d*)/i);
      
      const odCylMatch = text.match(/OD:?\s*.*CYL?\s*([+-]?\d+\.?\d*)/i);
      const odAxMatch = text.match(/OD:?\s*.*AX(?:IS)?\s*(\d+)/i);
      const osCylMatch = text.match(/OS:?\s*.*CYL?\s*([+-]?\d+\.?\d*)/i);
      const osAxMatch = text.match(/OS:?\s*.*AX(?:IS)?\s*(\d+)/i);

      const pdMatch = text.match(/PD:?\s*(\d+)/i);

      if (odMatch) odSph = parseFloat(odMatch[1]);
      if (osMatch) osSph = parseFloat(osMatch[1]);
      if (pdMatch) pdVal = parseInt(pdMatch[1]);
      
      if (odCylMatch) odCyl = parseFloat(odCylMatch[1]);
      if (odAxMatch) odAx = parseInt(odAxMatch[1]);
      if (osCylMatch) osCyl = parseFloat(osCylMatch[1]);
      if (osAxMatch) osAx = parseInt(osAxMatch[1]);

      form.setValue("matPhaiSph", odSph);
      form.setValue("matPhaiCyl", odCyl);
      form.setValue("matPhaiAx", odAx);
      form.setValue("matTraiSph", osSph);
      form.setValue("matTraiCyl", osCyl);
      form.setValue("matTraiAx", osAx);
      form.setValue("pd", pdVal);
      toast.success("✅ Đã nạp chỉ số tự động từ tệp máy khúc xạ!");
    };
    reader.readAsText(file);
  };

  const onSubmit = (values: ExamFormValues) => {
    const payload: HoSoKhamRequest = {
      makh: values.maKh,
      mans: values.maNs,
      matTraiSph: Number(values.matTraiSph) || 0,
      matTraiCyl: Number(values.matTraiCyl) || 0,
      matTraiAx: Number(values.matTraiAx) || 0,
      matPhaiSph: Number(values.matPhaiSph) || 0,
      matPhaiCyl: Number(values.matPhaiCyl) || 0,
      matPhaiAx: Number(values.matPhaiAx) || 0,
      pd: Number(values.pd) || 60,
      ketluan: values.ketluan,
    };

    const promise = new Promise((resolve, reject) => {
      mutation.mutate(payload, {
        onSuccess: (data) => {
          const res = data as unknown as HoSoKhamResponse;
          const maHoSo = res?.maHoSo || "HS_NEW"; 
          resolve(maHoSo);
        },
        onError: (err) => {
          const axiosError = err as AxiosError<JavaErrorResponse>;
          reject(axiosError.response?.data?.message || "Lỗi lưu hồ sơ khám");
        }
      });
    });

    toast.promise(promise, {
      loading: "Đang lưu bệnh án & chuyển hướng kê đơn...",
      success: (maHoSo: any) => {
        router.push(`/staff/clinic/prescriptions?maHoSo=${maHoSo}&maNs=${values.maNs}`);
        return "Lưu hồ sơ khám thành công!";
      },
      error: (err) => `Thao tác thất bại: ${err}`
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hồ sơ khám bệnh nhãn khoa</h1>
            <p className="text-slate-500 text-sm mt-0.5">Lập hồ sơ khúc xạ & lưu kết quả khám lâm sàng</p>
          </div>
        </div>

        {/* File upload from auto refractor */}
        <div className="relative">
          <input
            type="file"
            accept=".txt,.json"
            id="refractor-upload"
            className="hidden"
            onChange={handleAutoRefractorFile}
          />
          <label
            htmlFor="refractor-upload"
            className="h-10 px-4 border border-slate-200 rounded-xl bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2 text-sm font-semibold shadow-sm"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Nạp tệp đo khúc xạ (.txt)</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Inputs Form (7 Cols) */}
        <div className="lg:col-span-7">
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg">Nhập chỉ số khúc xạ</CardTitle>
              <CardDescription>Điền chi tiết hoặc nạp từ file tệp kết quả máy đo.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="maKh" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã Bệnh nhân</FormLabel>
                        <FormControl>
                          <Input 
                            readOnly={!!patientIdFromUrl} 
                            className={`font-mono ${patientIdFromUrl ? 'bg-slate-100' : 'bg-white'}`} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="maNs" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bác sĩ khám</FormLabel>
                        <FormControl>
                          <Input readOnly className="bg-slate-100 font-semibold text-blue-600" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-6">
                    {/* Mắt Phải (OD) */}
                    <div>
                      <h3 className="font-bold flex items-center text-slate-800 uppercase text-xs tracking-wider mb-3">
                        <Eye className="w-4 h-4 mr-2 text-blue-600" /> Mắt Phải (OD)
                      </h3>
                      <div className="grid grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <FormField control={form.control} name="matPhaiSph" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-slate-500 font-semibold">Cầu độ (SPH)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.25" 
                                className="bg-white h-9" 
                                placeholder="0.00" 
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="matPhaiCyl" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-slate-500 font-semibold">Loạn độ (CYL)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.25" 
                                className="bg-white h-9" 
                                placeholder="0.00" 
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="matPhaiAx" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-slate-500 font-semibold">Trục (AXIS)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                className="bg-white h-9" 
                                placeholder="0" 
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Mắt Trái (OS) */}
                    <div>
                      <h3 className="font-bold flex items-center text-slate-800 uppercase text-xs tracking-wider mb-3">
                        <Eye className="w-4 h-4 mr-2 text-indigo-600" /> Mắt Trái (OS)
                      </h3>
                      <div className="grid grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <FormField control={form.control} name="matTraiSph" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-slate-500 font-semibold">Cầu độ (SPH)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.25" 
                                className="bg-white h-9" 
                                placeholder="0.00" 
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="matTraiCyl" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-slate-500 font-semibold">Loạn độ (CYL)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.25" 
                                className="bg-white h-9" 
                                placeholder="0.00" 
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="matTraiAx" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-slate-500 font-semibold">Trục (AXIS)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                className="bg-white h-9" 
                                placeholder="0" 
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* PD & Kết luận */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="md:col-span-1">
                        <FormField control={form.control} name="pd" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-xs text-slate-700">KC đồng tử (PD - mm)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                className="bg-white font-mono h-10" 
                                placeholder="60" 
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <div className="md:col-span-2">
                        <FormField control={form.control} name="ketluan" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-xs text-slate-700">Kết luận khám bệnh</FormLabel>
                            <FormControl>
                              <Input 
                                className="bg-white h-10 font-medium" 
                                placeholder="Nhập kết luận của bác sĩ..." 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button type="submit" disabled={mutation.isPending} className="bg-blue-600 hover:bg-blue-700 min-w-[200px] h-11 rounded-xl">
                      {mutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <>Lưu & Sang Kê Đơn <ArrowRight className="ml-2 w-4 h-4" /></>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Eyeball Visual Refraction SVG (5 Cols) */}
        <div className="lg:col-span-5 h-full">
          <EyeRefractionMap 
            os={Number(matTraiSph) || 0} 
            od={Number(matPhaiSph) || 0} 
            pd={Number(pd) || 60} 
          />
        </div>

      </div>
    </div>
  );
}

export default function ExaminationPage() {
  return (
    <Suspense fallback={
      <div className="p-10 text-center flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-slate-500 font-semibold">Đang tải hồ sơ khám bệnh...</span>
      </div>
    }>
      <ExaminationContent />
    </Suspense>
  );
}