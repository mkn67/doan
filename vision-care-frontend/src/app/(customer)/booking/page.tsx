"use client";

import "@/app/globals.css";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDatLich, useBacSi, useGoiKham } from "@/hooks/useClinic";
import { useSlotTrong } from "@/hooks/useStaff";
import { SlotTrongDTO } from "@/types/staff";
import { useCreateKhachHang } from "@/hooks/useCustomer";

/* ─── icons inline (tránh phụ thuộc lucide version) ─── */
const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/>
  </svg>
);
const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconClock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconLogin = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);

/* ─── helpers ─── */
const formatSlotTime = (val: number) => {
  const hour = Math.floor(val);
  const minutes = Math.round((val - hour) * 60);
  return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const getInitials = (name: string) => {
  if (!name) return "BS";
  const parts = name.trim().split(" ");
  return (parts.pop()?.substring(0, 2) || "BS").toUpperCase();
};

/* ─── Step indicator ─── */
const steps = [
  { num: 1, label: "Thông tin" },
  { num: 2, label: "Bác sĩ" },
  { num: 3, label: "Gói khám" },
  { num: 4, label: "Thời gian" },
];

/* ─── Success screen ─── */
function SuccessScreen({ info, onReset, isLoggedIn, onGoProfile }: {
  info: { hoTen: string; ngayHen: string; gioHen: string; tenBs: string; tenGoi: string };
  onReset: () => void;
  isLoggedIn: boolean;
  onGoProfile: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center py-8 px-4 space-y-6">
      <div className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#dcfce7,#bbf7d0)" }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Đặt lịch thành công!</h3>
        <p className="mt-2 text-gray-500 text-sm">Phòng khám sẽ liên hệ xác nhận qua số điện thoại của bạn.</p>
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-gray-50 p-5 text-left space-y-3 text-sm">
        {[
          { label: "Bệnh nhân", value: info.hoTen },
          { label: "Bác sĩ", value: info.tenBs ? `Bs. ${info.tenBs}` : "—" },
          { label: "Gói khám", value: info.tenGoi || "—" },
          { label: "Ngày hẹn", value: info.ngayHen ? new Date(info.ngayHen + "T00:00:00").toLocaleDateString("vi-VN", { weekday:"long", day:"2-digit", month:"2-digit", year:"numeric" }) : "—" },
          { label: "Giờ hẹn", value: info.gioHen || "—" },
        ].map((item) => (
          <div key={item.label} className="flex justify-between">
            <span className="text-gray-500">{item.label}</span>
            <span className="font-semibold text-gray-800 text-right max-w-[60%]">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        {isLoggedIn ? (
          <button onClick={onGoProfile}
            className="flex-1 h-11 rounded-xl font-semibold text-sm text-white transition-all"
            style={{ background: "linear-gradient(135deg,#0f4c81,#2196f3)", boxShadow: "0 4px 15px rgba(33,150,243,0.35)" }}>
            Xem lịch hẹn của tôi
          </button>
        ) : null}
        <button onClick={onReset}
          className="flex-1 h-11 rounded-xl font-semibold text-sm border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all">
          Đặt lịch mới
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function BookingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { mutateAsync: datLich, isPending } = useDatLich();
  const createKhachHangMutation = useCreateKhachHang();

  /* remote data */
  const { data: listBacSi, isLoading: loadingBs } = useBacSi();
  const { data: listGoiKham, isLoading: loadingGoi } = useGoiKham();

  /* form state */
  const [hoTen, setHoTen] = useState("");
  const [sdt, setSdt] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [datChoNguoiThan, setDatChoNguoiThan] = useState(false);
  const [maNs, setMaNs] = useState("");
  const [maGoi, setMaGoi] = useState("");
  const [ngayHen, setNgayHen] = useState("");
  const [gioHen, setGioHen] = useState("");

  /* UI state */
  const [mounted, setMounted] = useState(false);
  const [minDate, setMinDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [successInfo, setSuccessInfo] = useState<null | {
    hoTen: string; ngayHen: string; gioHen: string; tenBs: string; tenGoi: string;
  }>(null);

  /* slots */
  const { data: slotsTrong, isLoading: loadingSlots } = useSlotTrong(ngayHen, maNs);

  /* prefill user */
  useEffect(() => {
    if (user && user.loaiTk === 'EXTERNAL' && !datChoNguoiThan) {
      setHoTen(user.hoTen || "");
      setSdt(user.sdt || "");
    } else {
      setHoTen("");
      setSdt("");
    }
  }, [user, datChoNguoiThan]);

  useEffect(() => {
    setMounted(true);
    const today = new Date();
    // min date = tomorrow (không cho đặt ngày hôm nay để tránh lỗi giờ)
    today.setDate(today.getDate() + 1);
    setMinDate(today.toISOString().split("T")[0]);
  }, []);

  /* validate */
  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!hoTen.trim()) e.hoTen = "Vui lòng nhập họ và tên người khám";
    if (!sdt.trim()) e.sdt = "Vui lòng nhập số điện thoại";
    else if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(sdt.trim())) e.sdt = "Số điện thoại không hợp lệ (VD: 0912345678)";
    if (!maNs) e.maNs = "Vui lòng chọn bác sĩ";
    if (!maGoi) e.maGoi = "Vui lòng chọn gói khám";
    if (!ngayHen) e.ngayHen = "Vui lòng chọn ngày khám";
    if (!gioHen) e.gioHen = "Vui lòng chọn giờ khám";
    return e;
  }, [hoTen, sdt, maNs, maGoi, ngayHen, gioHen]);

  const handleSubmit = async () => {
    setSubmitted(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      // scroll to first error
      const el = document.querySelector("[data-error]");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      let finalMaKh = "";

      if (user && user.loaiTk === 'EXTERNAL' && !datChoNguoiThan) {
        finalMaKh = user.maKh || user.username || "";
      } else {
        // Khách vãng lai hoặc đặt cho người thân → tạo KH mới
        const newKh = await createKhachHangMutation.mutateAsync({
          hoTen: hoTen.trim(),
          sdt: sdt.trim(),
          diaChi: diaChi.trim() || undefined,
        });
        finalMaKh = newKh.maKh;
      }

      const gioHenFull = `${ngayHen}T${gioHen}:00`;
      const selectedBs = (listBacSi as any[])?.find((b: any) => b.maNs === maNs);
      const selectedGoi = (listGoiKham as any[])?.find((g: any) => g.maGoi === maGoi);

      await datLich({
        maKh: finalMaKh,
        maNs,
        maGoi,
        ngayHen,
        gioHen: gioHenFull,
      });

      setSuccessInfo({
        hoTen: hoTen.trim(),
        ngayHen,
        gioHen,
        tenBs: selectedBs?.hoTen || "",
        tenGoi: selectedGoi?.tenGoi || "",
      });
    } catch (err: unknown) {
      const msg =
        (err as any)?.response?.data?.message ||
        (err instanceof Error ? err.message : String(err));
      setErrors({ submit: `Đặt lịch thất bại: ${msg}` });
    }
  };

  const handleReset = () => {
    setSuccessInfo(null);
    setSubmitted(false);
    setErrors({});
    setMaNs(""); setMaGoi(""); setNgayHen(""); setGioHen("");
    setDatChoNguoiThan(false);
    if (user) { setHoTen(user.hoTen || ""); setSdt(user.sdt || ""); setDiaChi(""); }
    else { setHoTen(""); setSdt(""); setDiaChi(""); }
  };

  const inputBase = "w-full h-11 px-4 rounded-xl border text-sm font-medium text-gray-800 bg-white transition-all outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400 placeholder:font-normal";
  const inputError = "border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-400";
  const inputOk = "border-gray-200 hover:border-gray-300";

  /* ── loading skeleton ── */
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-3 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10 px-4">
      {/* ─── Header ─── */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow"
            style={{ background: "linear-gradient(135deg,#0f4c81,#2196f3)" }}>
            <IconEye />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Đặt Lịch Khám Mắt</h1>
            <p className="text-xs text-gray-500 mt-0.5">Chọn bác sĩ, gói dịch vụ và khung giờ phù hợp</p>
          </div>
          {mounted && user && user.loaiTk === 'EXTERNAL' && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">{user.hoTen || user.username}</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Step bar ─── */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center">
          {steps.map((s, i) => {
            const stepDone =
              (s.num === 1 && hoTen && sdt) ||
              (s.num === 2 && maNs) ||
              (s.num === 3 && maGoi) ||
              (s.num === 4 && ngayHen && gioHen);
            return (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    stepDone ? "text-white shadow" : "text-gray-400 bg-gray-100"
                  }`} style={stepDone ? { background: "linear-gradient(135deg,#0f4c81,#2196f3)" } : {}}>
                    {stepDone ? <IconCheck /> : s.num}
                  </div>
                  <span className="text-[10px] font-medium text-gray-500 hidden sm:block">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 rounded-full transition-all"
                    style={{ background: stepDone ? "linear-gradient(90deg,#2196f3,#e2e8f0)" : "#e2e8f0" }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ─── Card ─── */}
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl shadow-blue-100/50 border border-gray-100 overflow-hidden">
        {successInfo ? (
          <SuccessScreen
            info={successInfo}
            onReset={handleReset}
            isLoggedIn={!!user}
            onGoProfile={() => router.push("/profile/appointments")}
          />
        ) : (
          <div className="p-6 md:p-8 space-y-8">

            {/* Guest banner */}
            {mounted && (!user || user.loaiTk !== 'EXTERNAL') && (
              <div className="flex items-start gap-3 p-4 rounded-2xl text-sm"
                style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                <div className="mt-0.5 text-blue-600 shrink-0"><IconLogin /></div>
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 text-sm">Bạn đang đặt lịch với tư cách khách</p>
                  <p className="text-blue-700 text-xs mt-0.5">Vui lòng nhập thông tin chính xác để hệ thống liên hệ xác nhận lịch hẹn.</p>
                </div>
                {!user && (
                  <button onClick={() => router.push("/auth/login")}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                    style={{ background: "#2563eb" }}>
                    <IconLogin /> Đăng nhập
                  </button>
                )}
              </div>
            )}

            {/* ── BƯỚC 1: Thông tin người khám ── */}
            <section className="space-y-4">
              <SectionTitle num={1} title="Thông tin người khám" color="#2196f3" />

              {/* Checkbox đặt hộ (chỉ hiện khi đã đăng nhập) */}
              {mounted && user && user.loaiTk === 'EXTERNAL' && (
                <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={datChoNguoiThan}
                    onChange={(e) => {
                      setDatChoNguoiThan(e.target.checked);
                      if (!e.target.checked) {
                        setHoTen(user.hoTen || ""); setSdt(user.sdt || ""); setDiaChi("");
                      } else {
                        setHoTen(""); setSdt(""); setDiaChi("");
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-600">Đặt lịch cho người thân</span>
                </label>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mounted && user && user.loaiTk === 'EXTERNAL' && !datChoNguoiThan ? (
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 text-sm text-blue-800 col-span-1 sm:col-span-2">
                    Bạn đang đặt lịch khám cho chính mình: <strong>{user.hoTen || user.username}</strong> - <strong>{user.sdt || "Chưa cập nhật SĐT"}</strong>
                  </div>
                ) : (
                  <>
                    {/* Họ tên */}
                    <div className="space-y-1.5" data-error={errors.hoTen ? "1" : undefined}>
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Nguyễn Văn An"
                        value={hoTen}
                        onChange={(e) => { setHoTen(e.target.value); if (submitted) setErrors(v => ({ ...v, hoTen: "" })); }}
                        className={`${inputBase} ${errors.hoTen ? inputError : inputOk}`}
                      />
                      {errors.hoTen && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{errors.hoTen}</p>}
                    </div>

                    {/* SĐT */}
                    <div className="space-y-1.5" data-error={errors.sdt ? "1" : undefined}>
                      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="0912 345 678"
                        value={sdt}
                        onChange={(e) => { setSdt(e.target.value); if (submitted) setErrors(v => ({ ...v, sdt: "" })); }}
                        className={`${inputBase} ${errors.sdt ? inputError : inputOk}`}
                      />
                      {errors.sdt && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{errors.sdt}</p>}
                    </div>

                    {/* Địa chỉ */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-gray-600">Địa chỉ liên hệ</label>
                      <input
                        type="text"
                        placeholder="Số nhà, đường, quận, tỉnh/thành phố..."
                        value={diaChi}
                        onChange={(e) => setDiaChi(e.target.value)}
                        className={`${inputBase} ${inputOk}`}
                      />
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* ── BƯỚC 2: Chọn bác sĩ ── */}
            <section className="space-y-4">
              <SectionTitle num={2} title="Chọn bác sĩ" color="#6366f1" />
              {errors.maNs && <p className="text-xs text-red-500 flex items-center gap-1" data-error="1"><span>⚠</span>{errors.maNs}</p>}

              {loadingBs ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : (listBacSi as any[])?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(listBacSi as any[]).map((bs: any) => {
                    const selected = maNs === bs.maNs;
                    return (
                      <button
                        key={bs.maNs}
                        type="button"
                        onClick={() => { setMaNs(bs.maNs); if (submitted) setErrors(v => ({ ...v, maNs: "" })); }}
                        className={`p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                          selected
                            ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
                            : "border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                          selected ? "text-white shadow" : "bg-blue-50 text-blue-700"
                        }`} style={selected ? { background: "linear-gradient(135deg,#0f4c81,#2196f3)" } : {}}>
                          {getInitials(bs.hoTen)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">Bs. {bs.hoTen}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{bs.chuyenKhoa || "Khám khúc xạ chung"}</p>
                        </div>
                        {selected && (
                          <div className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white"
                            style={{ background: "#2196f3" }}>
                            <IconCheck />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <EmptyState msg="Không có bác sĩ nào khả dụng." />
              )}
            </section>

            {/* ── BƯỚC 3: Chọn gói khám ── */}
            <section className="space-y-4">
              <SectionTitle num={3} title="Gói khám dịch vụ" color="#8b5cf6" />
              {errors.maGoi && <p className="text-xs text-red-500 flex items-center gap-1" data-error="1"><span>⚠</span>{errors.maGoi}</p>}

              {loadingGoi ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : (listGoiKham as any[])?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(listGoiKham as any[]).map((goi: any) => {
                    const selected = maGoi === goi.maGoi;
                    const price = goi.giaGoi ?? goi.gia ?? 0;
                    return (
                      <button
                        key={goi.maGoi}
                        type="button"
                        onClick={() => { setMaGoi(goi.maGoi); if (submitted) setErrors(v => ({ ...v, maGoi: "" })); }}
                        className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-3 transition-all ${
                          selected
                            ? "border-violet-500 bg-violet-50 shadow-md shadow-violet-100"
                            : "border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm text-gray-900 leading-snug">{goi.tenGoi}</p>
                            {goi.moTa && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{goi.moTa}</p>}
                          </div>
                          {selected && (
                            <div className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white mt-0.5"
                              style={{ background: "#8b5cf6" }}>
                              <IconCheck />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-400">Trọn gói</span>
                          <span className={`font-bold text-sm ${selected ? "text-violet-700" : "text-gray-700"}`}>
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <EmptyState msg="Không có gói khám nào khả dụng." />
              )}
            </section>

            {/* ── BƯỚC 4: Thời gian ── */}
            <section className="space-y-4">
              <SectionTitle num={4} title="Chọn thời gian khám" color="#0f4c81" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ngày */}
                <div className="space-y-1.5" data-error={errors.ngayHen ? "1" : undefined}>
                  <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    <IconCalendar /> Ngày khám <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={minDate || undefined}
                    value={ngayHen}
                    onChange={(e) => {
                      setNgayHen(e.target.value);
                      setGioHen("");
                      if (submitted) setErrors(v => ({ ...v, ngayHen: "", gioHen: "" }));
                    }}
                    className={`${inputBase} ${errors.ngayHen ? inputError : inputOk}`}
                  />
                  {errors.ngayHen && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{errors.ngayHen}</p>}
                </div>

                {/* Slots */}
                <div className="space-y-1.5" data-error={errors.gioHen ? "1" : undefined}>
                  <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    <IconClock /> Chọn giờ khám <span className="text-red-500">*</span>
                  </label>

                  {!maNs && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700 font-medium">
                      Vui lòng chọn bác sĩ trước.
                    </div>
                  )}
                  {maNs && !ngayHen && (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 font-medium">
                      Vui lòng chọn ngày khám trước.
                    </div>
                  )}
                  {maNs && ngayHen && loadingSlots && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-600 font-medium animate-pulse">
                      Đang tìm các giờ trống...
                    </div>
                  )}
                  {maNs && ngayHen && !loadingSlots && (
                    <div className="relative text-slate-400">
                      <select
                        value={gioHen}
                        onChange={(e) => { setGioHen(e.target.value); if (submitted) setErrors(v => ({ ...v, gioHen: "" })); }}
                        className="w-full h-11 pl-4 pr-10 rounded-xl border text-sm font-semibold text-gray-800 bg-white border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Chọn giờ muốn khám...</option>
                        {(slotsTrong as SlotTrongDTO[])?.map((slot, idx) => {
                          const timeStr = formatSlotTime(slot.gioBatDau);
                          return (
                            <option key={idx} value={timeStr} className="font-semibold py-1">
                              {timeStr}
                            </option>
                          );
                        })}
                      </select>
                      <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>
                    </div>
                  )}
                  {errors.gioHen && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{errors.gioHen}</p>}
                </div>
              </div>
            </section>

            {/* Submit error */}
            {errors.submit && (
              <div className="flex items-start gap-2 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {errors.submit}
              </div>
            )}

            {/* CTA */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || createKhachHangMutation.isPending}
              className="w-full h-12 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg,#0f4c81,#2196f3)",
                boxShadow: "0 4px 20px rgba(33,150,243,0.4)"
              }}
            >
              {(isPending || createKhachHangMutation.isPending) ? (
                <>
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <IconCalendar />
                  Xác nhận đặt lịch khám
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Sub components ─── */
function SectionTitle({ num, title, color }: { num: number; title: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ background: color }}>
        {num}
      </div>
      <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="p-5 text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-2xl bg-gray-50">
      {msg}
    </div>
  );
}
