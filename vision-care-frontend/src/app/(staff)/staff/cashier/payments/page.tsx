"use client";

import React, { useState, useRef } from "react";
import {
  CreditCard,
  Search,
  Banknote,
  CheckCircle2,
  Clock,
  Loader2,
  Printer,
  ReceiptText,
  ArrowLeft,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";

import { useDanhSachHoaDon, useThanhToan } from "@/hooks/useBilling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HoaDonResponseDTO, ThanhToanRequestDTO } from "@/types/billing";

interface PageResponseDTO {
  content?: unknown[];
  data?: unknown[];
}

export default function PaymentsPage() {
  const router = useRouter();
  const { data: listHoaDon, isLoading } = useDanhSachHoaDon();
  const thanhToanMutation = useThanhToan();
  const [searchTerm, setSearchTerm] = useState("");

  // ==========================================
  // STATE: THANH TOÁN
  // ==========================================
  const [isOpen, setIsOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] =
    useState<HoaDonResponseDTO | null>(null);
  const [phuongThuc, setPhuongThuc] = useState("Tiền mặt");

  // ==========================================
  // STATE & LOGIC: IN HÓA ĐƠN PDF
  // ==========================================
  const printRef = useRef<HTMLDivElement>(null);
  const [invoiceToPrint, setInvoiceToPrint] =
    useState<HoaDonResponseDTO | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `HoaDon_VisionCare_${invoiceToPrint?.maHd || "New"}`,
    onAfterPrint: () => setInvoiceToPrint(null),
  });

  const triggerPrint = (invoice: HoaDonResponseDTO) => {
    setInvoiceToPrint(invoice);
    // Delay nhẹ 100ms để React kịp render dữ liệu vào DOM ẩn rồi mới bật hộp thoại In
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  // ==========================================
  // XỬ LÝ DỮ LIỆU BẢNG
  // ==========================================
  const invoices: HoaDonResponseDTO[] = Array.isArray(listHoaDon)
    ? listHoaDon
    : ((listHoaDon as unknown as PageResponseDTO)
        ?.content as HoaDonResponseDTO[]) || [];

  const filteredInvoices = invoices.filter(
    (hd: HoaDonResponseDTO) =>
      hd.maHd?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hd.tenKhachHang?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenPayment = (invoice: HoaDonResponseDTO) => {
    setSelectedInvoice(invoice);
    setPhuongThuc("Tiền mặt");
    setIsOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedInvoice) return;

    // DEBUG: Kiểm tra giá trị thực tế của hóa đơn
    console.log("Hóa đơn đang thanh toán:", selectedInvoice);

    const userStr = localStorage.getItem("user");
    const userObj = userStr ? JSON.parse(userStr) : null;
    const maNs = userObj?.maNs || userObj?.username || "NS000";

    const payload: ThanhToanRequestDTO = {
      maHd: selectedInvoice.maHd,
      maNs: maNs,
      hinhThucThanhToan: phuongThuc,
      soTien: Number(selectedInvoice.tongTien) || 0,
    };

    if (payload.soTien <= 0) {
      alert("⚠️ Số tiền thanh toán phải lớn hơn 0!");
      return;
    }

    thanhToanMutation.mutate(payload, {
      onSuccess: () => {
        alert("✅ Thanh toán thành công!");
        setIsOpen(false);
        // Gợi ý in luôn sau khi thanh toán
        triggerPrint(selectedInvoice);
      },
      onError: () => alert("❌ Lỗi xử lý thanh toán!"),
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* HEADER TÌM KIẾM */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/staff/cashier")}
            className="rounded-full hover:bg-slate-100"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <Banknote className="w-5 h-5" />
              </div>
              Thanh toán hóa đơn
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Xử lý giao dịch và in ấn hóa đơn
            </p>
          </div>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <Input
            placeholder="Tìm theo Mã HĐ, Tên khách hàng..."
            className="pl-10 h-10 border-slate-200 bg-slate-50 focus-visible:ring-emerald-500 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-100">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-slate-600">
                Mã HĐ
              </TableHead>
              <TableHead className="font-semibold text-slate-600">
                Khách hàng
              </TableHead>
              <TableHead className="font-semibold text-slate-600">
                Ngày lập
              </TableHead>
              <TableHead className="font-semibold text-slate-600 text-right">
                Tổng tiền
              </TableHead>
              <TableHead className="font-semibold text-slate-600 text-center">
                Trạng thái
              </TableHead>
              <TableHead className="font-semibold text-slate-600 text-center w-36">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
                    <span>Đang tải dữ liệu hóa đơn...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredInvoices.length > 0 ? (
              filteredInvoices.map((hd: HoaDonResponseDTO) => (
                <TableRow
                  key={hd.maHd}
                  className="hover:bg-emerald-50/30 transition-colors group"
                >
                  <TableCell className="font-bold text-slate-800">
                    {hd.maHd}
                  </TableCell>
                  <TableCell className="font-medium text-slate-600">
                    {hd.tenKhachHang || "Khách vãng lai"}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {hd.ngayLap
                      ? new Date(hd.ngayLap).toLocaleDateString("vi-VN")
                      : "---"}
                  </TableCell>
                  <TableCell className="text-right font-bold text-emerald-600 text-base">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(hd.tongTien || 0)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                        hd.trangThai === "Đã thanh toán" ||
                        hd.trangThai === "Thành công"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {hd.trangThai === "Đã thanh toán" ||
                      hd.trangThai === "Thành công" ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {hd.trangThai || "Chưa thanh toán"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {hd.trangThai === "Chưa thanh toán" ||
                    hd.trangThai === "Chờ thanh toán" ? (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white w-full shadow-sm rounded-lg"
                        onClick={() => handleOpenPayment(hd)}
                      >
                        Thu tiền
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 w-full rounded-lg transition-all"
                        onClick={() => triggerPrint(hd)}
                      >
                        <Printer className="w-4 h-4 mr-1.5" /> In Bill
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-48 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <ReceiptText className="w-10 h-10 text-slate-300 mb-2" />
                    Không tìm thấy hóa đơn nào khớp với &quot;{searchTerm}&quot;.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ========================================== */}
      {/* DIALOG XÁC NHẬN THANH TOÁN               */}
      {/* ========================================== */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="w-6 h-6 text-emerald-600" /> Xác nhận thanh
              toán
            </DialogTitle>
            <DialogDescription>
              Kiểm tra kỹ thông tin trước khi thu tiền của khách.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Mã hóa đơn:</span>
                <span className="font-bold text-slate-800">
                  {selectedInvoice?.maHd}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Khách hàng:</span>
                <span className="font-bold text-slate-800">
                  {selectedInvoice?.tenKhachHang}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 mt-2">
                <span className="font-semibold text-slate-700">Tổng thu:</span>
                <span className="text-2xl font-black text-emerald-600">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(selectedInvoice?.tongTien || 0)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Hình thức thanh toán
              </label>
              <Select value={phuongThuc} onValueChange={setPhuongThuc}>
                <SelectTrigger className="h-11 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tiền mặt">💵 Tiền mặt</SelectItem>
                  <SelectItem value="Chuyển khoản">
                    📱 Chuyển khoản (Mã QR)
                  </SelectItem>
                  <SelectItem value="Thẻ tín dụng">
                    💳 Quẹt thẻ (POS)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {phuongThuc === "Chuyển khoản" && selectedInvoice && (
              <div className="mt-2 p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mã QR Thanh Toán VietQR</span>
                <div className="p-2 bg-white border border-emerald-100 rounded-xl shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.vietqr.io/image/MB-1903678999999-compact2.png?amount=${selectedInvoice.tongTien}&addInfo=Thanh%20toan%20hoa%20don%20${selectedInvoice.maHd}&accountName=PHONG%20KHAM%20VISION%20CARE`}
                    alt="VietQR Dynamic payment"
                    className="w-48 h-48 object-contain"
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-700 font-bold">Ngân hàng Quân Đội (MB)</p>
                  <p className="text-[11px] text-slate-500 font-medium">STK: 1903678999999 - PHONG KHAM VISION CARE</p>
                  <p className="text-[10px] text-emerald-600 mt-1 font-semibold">Tự động điền số tiền & nội dung hóa đơn khi quét</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="rounded-lg"
            >
              Hủy bỏ
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 rounded-lg px-6"
              onClick={handleConfirmPayment}
              disabled={thanhToanMutation.isPending}
            >
              {thanhToanMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Xác nhận Đã Thu"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================== */}
      {/* BẢN MẪU IN HÓA ĐƠN (ẨN TRÊN UI, CHỈ HIỆN KHI IN) */}
      {/* ========================================== */}
      <div className="hidden">
        <div
          ref={printRef}
          className="p-10 font-sans text-slate-800 bg-white mx-auto max-w-3xl"
        >
          {/* Header Bill */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                VISION CARE
              </h1>
              <p className="text-sm font-semibold text-slate-600 mt-1">
                Hệ Thống Chăm Sóc Mắt Toàn Diện
              </p>
              <p className="text-sm text-slate-500 mt-1">
                123 Đường Tôn Đức Thắng, Quận 1, TP.HCM
              </p>
              <p className="text-sm text-slate-500">
                Hotline: 1900 9999 - Email: cskh@visioncare.vn
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-slate-800 tracking-widest">
                INVOICE
              </h2>
              <p className="text-sm font-semibold mt-2">
                Mã HĐ: <span className="font-bold">{invoiceToPrint?.maHd}</span>
              </p>
              <p className="text-sm text-slate-600">
                Ngày:{" "}
                {invoiceToPrint?.ngayLap
                  ? new Date(invoiceToPrint.ngayLap).toLocaleDateString("vi-VN")
                  : new Date().toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>

          {/* Khách hàng Info */}
          <div className="mt-8 mb-8 flex justify-between">
            <div>
              <h3 className="font-bold text-slate-800 mb-2 uppercase text-sm">
                Khách hàng
              </h3>
              <p className="text-lg font-semibold">
                {invoiceToPrint?.tenKhachHang || "Khách vãng lai"}
              </p>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-slate-800 mb-2 uppercase text-sm">
                Trạng thái
              </h3>
              <p className="text-lg font-semibold text-emerald-600">
                {invoiceToPrint?.trangThai}
              </p>
              <p className="text-sm text-slate-500">
                Nhân viên: {invoiceToPrint?.tenNhanVienLap}
              </p>
            </div>
          </div>

          {/* Bảng tóm tắt (Do không có chi tiết nên in tổng tiền) */}
          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-3 font-bold text-slate-700">
                  Nội dung dịch vụ / Sản phẩm
                </th>
                <th className="py-3 font-bold text-slate-700 text-right">
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-4 text-slate-700">
                  Chi phí Khám mắt & Gia công kính (Tổng hợp)
                </td>
                <td className="py-4 text-right font-semibold">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(invoiceToPrint?.tongTien || 0)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Tổng tiền Box */}
          <div className="flex justify-end mb-12">
            <div className="w-72 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500">Tổng cộng:</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(invoiceToPrint?.tongTien || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-800">
                  CẦN THANH TOÁN:
                </span>
                <span className="text-xl font-black text-slate-900">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(invoiceToPrint?.tongTien || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer & QR Code */}
          <div className="flex items-center justify-between border-t-2 border-slate-100 pt-8 mt-auto">
            <div>
              <p className="font-bold text-slate-800">
                Cảm ơn quý khách đã tin dùng dịch vụ!
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Lưu ý: Hóa đơn điện tử có giá trị lưu hành toàn quốc.
              </p>
              <p className="text-sm text-slate-500">
                Hàng đã mua vui lòng không đổi trả nếu không có lỗi từ NSX.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-2 border-2 border-slate-200 rounded-xl bg-white">
                <QRCodeSVG
                  value={`https://visioncare.vn/tra-cuu-hoa-don/${invoiceToPrint?.maHd}`}
                  size={100}
                  level={"H"}
                  includeMargin={false}
                />
              </div>
              <span className="text-xs font-semibold mt-2 text-slate-500">
                Quét mã tra cứu HĐ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
