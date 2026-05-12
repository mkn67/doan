"use client";

import React, { useState } from "react";
import { CreditCard, Search, Banknote, CheckCircle2, Clock, Loader2 } from "lucide-react";

import { useDanhSachHoaDon, useThanhToan } from "@/hooks/useBilling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HoaDonResponseDTO, ThanhToanRequestDTO } from "@/types/billing";

interface PageResponseDTO {
  content?: unknown[];
  data?: unknown[];
}

export default function PaymentsPage() {
  const { data: listHoaDon, isLoading } = useDanhSachHoaDon();
  const thanhToanMutation = useThanhToan();
  const [searchTerm, setSearchTerm] = useState("");
  
  // State quản lý Dialog thanh toán
  const [isOpen, setIsOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<HoaDonResponseDTO | null>(null);
  const [phuongThuc, setPhuongThuc] = useState("Tiền mặt");

  const invoices: HoaDonResponseDTO[] = Array.isArray(listHoaDon) 
    ? listHoaDon 
    : ((listHoaDon as unknown as PageResponseDTO)?.content as HoaDonResponseDTO[]) || [];
  
  const filteredInvoices = invoices.filter((hd: HoaDonResponseDTO) => 
    hd.maHd?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    hd.tenKhachHang?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenPayment = (invoice: HoaDonResponseDTO) => {
    setSelectedInvoice(invoice);
    setPhuongThuc("Tiền mặt");
    setIsOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedInvoice) return;
    
    // Lấy mã nhân sự đang đăng nhập (Thu ngân)
    const userStr = localStorage.getItem("user");
    const maNs = userStr ? JSON.parse(userStr).username : "NS000";

    const payload: ThanhToanRequestDTO = {
      maHd: selectedInvoice.maHd,
      maNs: maNs,
      hinhThucThanhToan: phuongThuc,
      soTien: selectedInvoice.tongTien || 0,
    };

    thanhToanMutation.mutate(payload, {
      onSuccess: () => {
        alert("✅ Thanh toán thành công!");
        setIsOpen(false);
      },
      onError: () => alert("❌ Lỗi xử lý thanh toán!")
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl shadow-sm">
            <Banknote className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quầy Thu Ngân (Payments)</h1>
            <p className="text-slate-500 mt-1">Xử lý giao dịch thanh toán hóa đơn cho khách hàng.</p>
          </div>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Tìm theo Mã HĐ, Tên KH..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold">Mã HĐ</TableHead>
              <TableHead className="font-semibold">Khách hàng</TableHead>
              <TableHead className="font-semibold">Ngày lập</TableHead>
              <TableHead className="font-semibold text-right">Tổng tiền</TableHead>
              <TableHead className="font-semibold text-center">Trạng thái</TableHead>
              <TableHead className="font-semibold text-center w-32">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500"/></TableCell></TableRow>
            ) : filteredInvoices.length > 0 ? (
              filteredInvoices.map((hd: HoaDonResponseDTO) => (
                <TableRow key={hd.maHd} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-bold text-slate-800">{hd.maHd}</TableCell>
                  
                  
                  <TableCell className="font-medium text-slate-600">{hd.tenKhachHang || "Khách vãng lai"}</TableCell>
                  
                  <TableCell className="text-slate-500">{hd.ngayLap ? new Date(hd.ngayLap).toLocaleDateString("vi-VN") : "---"}</TableCell>
                  <TableCell className="text-right font-bold text-emerald-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(hd.tongTien || 0)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                      hd.trangThai === "Đã thanh toán" || hd.trangThai === "Thành công"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {hd.trangThai === "Đã thanh toán" || hd.trangThai === "Thành công" 
                        ? <CheckCircle2 className="w-3 h-3 mr-1"/> 
                        : <Clock className="w-3 h-3 mr-1"/>}
                      {hd.trangThai || "Chưa thanh toán"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {(hd.trangThai === "Chưa thanh toán" || hd.trangThai === "Chờ thanh toán") && (
                      <Button 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700 h-8 w-full shadow-sm"
                        onClick={() => handleOpenPayment(hd)}
                      >
                        Thu tiền
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-500">Không tìm thấy hóa đơn nào.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* DIALOG XÁC NHẬN THANH TOÁN */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-emerald-600"/> Xác nhận thanh toán</DialogTitle>
            <DialogDescription>
              Kiểm tra kỹ số tiền và chọn phương thức thanh toán.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Mã hóa đơn:</span><span className="font-bold text-slate-800">{selectedInvoice?.maHd}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Khách hàng:</span><span className="font-bold text-slate-800">{selectedInvoice?.tenKhachHang}</span></div>
              <div className="flex justify-between text-lg pt-2 border-t mt-2"><span className="font-semibold text-slate-700">Tổng thu:</span><span className="font-black text-emerald-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedInvoice?.tongTien || 0)}
              </span></div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Phương thức thanh toán</label>
              <Select value={phuongThuc} onValueChange={setPhuongThuc}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
                  <SelectItem value="Chuyển khoản">Chuyển khoản (Mã QR)</SelectItem>
                  <SelectItem value="Thẻ tín dụng">Quẹt thẻ (POS)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleConfirmPayment} disabled={thanhToanMutation.isPending}>
              {thanhToanMutation.isPending ? "Đang xử lý..." : "Xác nhận Đã Thu Tiền"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}