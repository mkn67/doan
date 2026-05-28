import React from "react";
import { HoSoKhamResponse, ChiTietThiLuc } from "@/types/clinic";
import { Eye, ShieldCheck, Sparkles } from "lucide-react";

interface PrintA4RecordProps {
  record: HoSoKhamResponse | null;
}

export const PrintA4Record = React.forwardRef<HTMLDivElement, PrintA4RecordProps>(
  ({ record }, ref) => {
    if (!record) return null;

    const getEyeDetails = (type: "P" | "T"): ChiTietThiLuc => {
      return (
        record.danhSachThiLuc?.find((ct) => ct.loaiMat === type) || {
          loaiMat: type,
          sph: 0,
          cyl: 0,
          axis: 0,
          va: "10/10",
        }
      );
    };

    const od = getEyeDetails("P");
    const os = getEyeDetails("T");
    const pd = record.danhSachThiLuc?.[0]?.pd || 60;

    // SVG Eyeball visual map representation for printing
    const getEyeColor = (val: number) => {
      if (val === 0) return "#10b981"; // Emerald
      return val < 0 ? "#0284c7" : "#dc2626"; // Myopia vs Hyperopia
    };

    return (
      <div
        ref={ref}
        className="p-12 bg-white text-slate-800 font-sans print:p-8"
        style={{ width: "210mm", minHeight: "297mm", boxSizing: "border-box" }}
      >
        {/* HEADER */}
        <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-blue-600 flex items-center gap-2">
              <Eye className="w-6 h-6 text-blue-500" />
              VISION CARE
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Hệ thống Trung tâm Mắt kính Kỹ thuật cao
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Địa chỉ: 123 Đường Ba Tháng Hai, Quận 10, TP. Hồ Chí Minh
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Hotline: 1900 6789</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-slate-700">PHIẾU KHÁM KHÚC XẠ</h2>
            <p className="text-sm font-mono text-slate-500 mt-1">Mã hồ sơ: {record.maHoSo}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Ngày khám: {record.ngayKham ? new Date(record.ngayKham).toLocaleDateString("vi-VN") : "---"}
            </p>
          </div>
        </div>

        {/* PATIENT INFO */}
        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Thông tin khách hàng</p>
            <h3 className="text-lg font-black text-slate-800 mt-1">{record.tenKhachHang}</h3>
            <p className="text-sm font-mono text-slate-500 mt-1">Mã KH: {record.maKh}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Chuyên viên khúc xạ</p>
            <h3 className="text-base font-bold text-slate-800 mt-1">{record.tenBacSi}</h3>
            <p className="text-sm text-slate-500 mt-1">Phòng khám chuyên khoa mắt Vision Care</p>
          </div>
        </div>

        {/* REFRACTION METRICS TABLE */}
        <div className="mb-8">
          <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" /> Thông số đo mắt chi tiết
          </h4>
          <table className="w-full border-collapse border border-slate-200 text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold">
                <th className="border border-slate-200 px-4 py-3 text-left">Nhãn khoa</th>
                <th className="border border-slate-200 px-4 py-3 text-center">Độ Cầu (SPH)</th>
                <th className="border border-slate-200 px-4 py-3 text-center">Độ Loạn (CYL)</th>
                <th className="border border-slate-200 px-4 py-3 text-center">Trục loạn (AXIS)</th>
                <th className="border border-slate-200 px-4 py-3 text-center">Thị lực (VA)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-200 px-4 py-3 font-bold text-blue-600">Mắt Phải (OD)</td>
                <td className="border border-slate-200 px-4 py-3 text-center font-mono font-semibold">
                  {od.sph !== undefined && od.sph > 0 ? `+${od.sph.toFixed(2)}` : od.sph?.toFixed(2) || "0.00"} D
                </td>
                <td className="border border-slate-200 px-4 py-3 text-center font-mono">
                  {od.cyl !== undefined && od.cyl > 0 ? `+${od.cyl.toFixed(2)}` : od.cyl?.toFixed(2) || "0.00"} D
                </td>
                <td className="border border-slate-200 px-4 py-3 text-center font-mono">
                  {od.axis || "0"}°
                </td>
                <td className="border border-slate-200 px-4 py-3 text-center font-semibold">{od.va || "10/10"}</td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="border border-slate-200 px-4 py-3 font-bold text-indigo-600">Mắt Trái (OS)</td>
                <td className="border border-slate-200 px-4 py-3 text-center font-mono font-semibold">
                  {os.sph !== undefined && os.sph > 0 ? `+${os.sph.toFixed(2)}` : os.sph?.toFixed(2) || "0.00"} D
                </td>
                <td className="border border-slate-200 px-4 py-3 text-center font-mono">
                  {os.cyl !== undefined && os.cyl > 0 ? `+${os.cyl.toFixed(2)}` : os.cyl?.toFixed(2) || "0.00"} D
                </td>
                <td className="border border-slate-200 px-4 py-3 text-center font-mono">
                  {os.axis || "0"}°
                </td>
                <td className="border border-slate-200 px-4 py-3 text-center font-semibold">{os.va || "10/10"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PD SUMMARY */}
        <div className="flex justify-between items-center border border-slate-200 rounded-xl p-4 mb-8 bg-slate-50/50">
          <span className="text-sm font-semibold text-slate-600">Khoảng cách đồng tử (PD):</span>
          <span className="text-base font-black font-mono text-blue-600">{pd} mm</span>
        </div>

        {/* EYE SCHEMATIC VISUALS FOR PRINT */}
        <div className="grid grid-cols-2 gap-8 mb-8 border border-slate-100 rounded-2xl p-6 bg-slate-50/30">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sơ đồ Mắt Phải (OD)</span>
            <svg className="w-24 h-24 filter drop-shadow" viewBox="0 0 100 100">
              <ellipse cx="50" cy="50" rx="46" ry="30" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="22" fill={getEyeColor(od.sph || 0)} opacity="0.85" stroke="#64748b" strokeWidth="1" />
              <circle cx="50" cy="50" r="14" fill="#0f172a" />
              <circle cx="43" cy="43" r="3" fill="#ffffff" opacity="0.9" />
            </svg>
            <span className="text-sm font-bold mt-1 text-slate-700">
              {od.sph && od.sph > 0 ? `Hyperopia (+${od.sph})` : od.sph && od.sph < 0 ? `Myopia (${od.sph})` : "Normal"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sơ đồ Mắt Trái (OS)</span>
            <svg className="w-24 h-24 filter drop-shadow" viewBox="0 0 100 100">
              <ellipse cx="50" cy="50" rx="46" ry="30" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="22" fill={getEyeColor(os.sph || 0)} opacity="0.85" stroke="#64748b" strokeWidth="1" />
              <circle cx="50" cy="50" r="14" fill="#0f172a" />
              <circle cx="43" cy="43" r="3" fill="#ffffff" opacity="0.9" />
            </svg>
            <span className="text-sm font-bold mt-1 text-slate-700">
              {os.sph && os.sph > 0 ? `Hyperopia (+${os.sph})` : os.sph && os.sph < 0 ? `Myopia (${os.sph})` : "Normal"}
            </span>
          </div>
        </div>

        {/* CONCLUSION */}
        <div className="border border-blue-100 rounded-2xl p-6 bg-blue-50/20 mb-6">
          <h4 className="text-sm font-black text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" /> Kết luận & Lời khuyên của chuyên gia
          </h4>
          <p className="text-sm text-slate-700 font-semibold leading-relaxed">
            {record.ketLuan || "Chưa có kết luận chi tiết từ chuyên viên khúc xạ."}
          </p>
        </div>

        {/* DON KINH GIA CONG & DON THUOC NHO MAT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Lens processing order */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/30">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              👓 Chỉ định đơn kính gia công
            </h4>
            {record.donKinh ? (
              <div className="text-sm font-bold text-slate-800 bg-white p-3 rounded-xl border border-slate-100 shadow-sm leading-relaxed whitespace-pre-wrap">
                {record.donKinh}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Không có chỉ định gia công kính.</p>
            )}
          </div>

          {/* Eye drops prescription */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/30">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              💧 Đơn thuốc nhỏ mắt
            </h4>
            {record.donThuocList && record.donThuocList.length > 0 ? (
              <ul className="space-y-2">
                {record.donThuocList.map((item, idx) => (
                  <li key={idx} className="text-sm font-semibold text-slate-800 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm leading-relaxed break-words whitespace-pre-wrap">
                    {idx + 1}. {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">Không có đơn thuốc nhỏ mắt kèm theo.</p>
            )}
          </div>
        </div>

        {/* SIGNATURES */}
        <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-100">
          <div className="text-center w-48">
            <p className="text-xs text-slate-400 font-bold uppercase">Chữ ký Khách hàng</p>
            <div className="h-16" />
            <p className="text-sm font-bold text-slate-700">{record.tenKhachHang}</p>
          </div>
          <div className="text-center w-48">
            <p className="text-xs text-slate-400 font-bold uppercase">Chữ ký Chuyên viên</p>
            <div className="h-16" />
            <p className="text-sm font-bold text-slate-700">{record.tenBacSi}</p>
          </div>
        </div>
      </div>
    );
  }
);

PrintA4Record.displayName = "PrintA4Record";
