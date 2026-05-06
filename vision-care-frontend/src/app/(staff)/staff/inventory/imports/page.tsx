"use client";
import "@/app/globals.css";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDanhSachPhieuNhap, useCreatePhieuNhap } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2 } from "lucide-react";

// Schema validation cho một lô hàng
const loHangSchema = z.object({
  maSp: z.string().min(1, "Mã sản phẩm không được để trống"),
  soLuongNhap: z.number().min(1, "Số lượng nhập phải > 0"),
  giaNhap: z.number().min(0, "Giá nhập không được âm"),
});

// Schema cho toàn bộ form
const phieuNhapSchema = z.object({
  maNcc: z.string().min(1, "Vui lòng chọn nhà cung cấp"),
  maNs: z.string().min(1, "Vui lòng chọn nhân viên nhập kho"),
  loHangList: z.array(loHangSchema).min(1, "Phải có ít nhất một lô hàng"),
});

type PhieuNhapFormValues = z.infer<typeof phieuNhapSchema>;

// Dữ liệu mẫu cho nhà cung cấp và nhân viên (bạn có thể gọi API thực tế)
const mockNhaCungCap = [
  { maNcc: "NCC001", tenNcc: "Công ty Kính Á Châu" },
  { maNcc: "NCC002", tenNcc: "Nhà phân phối Thuốc nhãn khoa Việt" },
];
const mockNhanVien = [
  { maNs: "NS001", tenNs: "Nguyễn Văn A (Thủ kho)" },
  { maNs: "NS002", tenNs: "Trần Thị B (Thủ kho)" },
];

export default function ImportsPage() {
  const queryClient = useQueryClient();
  const { data: phieuNhapPage, isLoading: isLoadingList } = useDanhSachPhieuNhap();
  const createMutation = useCreatePhieuNhap();

  const form = useForm<PhieuNhapFormValues>({
    resolver: zodResolver(phieuNhapSchema),
    defaultValues: {
      maNcc: "",
      maNs: "",
      loHangList: [{ maSp: "", soLuongNhap: 1, giaNhap: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "loHangList",
  });

  const onSubmit = (data: PhieuNhapFormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Nhập kho thành công!");
        form.reset({
          maNcc: "",
          maNs: "",
          loHangList: [{ maSp: "", soLuongNhap: 1, giaNhap: 0 }],
        });
        queryClient.invalidateQueries({ queryKey: ["phieu-nhap"] });
      },
      onError: (error: Error) => {
        toast.error(error.message || "Có lỗi xảy ra");
      },
    });
  };

  // Lấy danh sách phiếu nhập từ page response
  const phieuNhapList = phieuNhapPage?.content || [];

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-2xl font-bold">Quản lý nhập kho</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tạo phiếu nhập mới</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maNcc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhà cung cấp</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn nhà cung cấp" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockNhaCungCap.map((ncc) => (
                            <SelectItem key={ncc.maNcc} value={ncc.maNcc}>
                              {ncc.tenNcc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maNs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhân viên nhập</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn nhân viên" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockNhanVien.map((nv) => (
                            <SelectItem key={nv.maNs} value={nv.maNs}>
                              {nv.tenNs}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Danh sách lô hàng</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ maSp: "", soLuongNhap: 1, giaNhap: 0 })}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Thêm dòng
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã sản phẩm</TableHead>
                      <TableHead>Số lượng nhập</TableHead>
                      <TableHead>Giá nhập</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`loHangList.${index}.maSp`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Mã SP" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`loHangList.${index}.soLuongNhap`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Số lượng"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`loHangList.${index}.giaNhap`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="1000"
                                    placeholder="Giá nhập"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {form.formState.errors.loHangList && (
                  <p className="text-sm text-red-500">{form.formState.errors.loHangList.message}</p>
                )}
              </div>

              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Xác nhận nhập kho
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử phiếu nhập</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingList ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã phiếu</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Tổng tiền (VNĐ)</TableHead>
                  <TableHead>Ngày nhập</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {phieuNhapList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Chưa có phiếu nhập nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  phieuNhapList.map((pn) => (
                    <TableRow key={pn.maPn}>
                      <TableCell>{pn.maPn}</TableCell>
                      <TableCell>{pn.tenNcc}</TableCell>
                      <TableCell>{pn.tongTien?.toLocaleString("vi-VN")}</TableCell>
                      <TableCell>{pn.ngayNhap ? new Date(pn.ngayNhap).toLocaleDateString("vi-VN") : ""}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
          {/* Nếu backend hỗ trợ phân trang, bạn có thể thêm Pagination component */}
        </CardContent>
      </Card>
    </div>
  );
}