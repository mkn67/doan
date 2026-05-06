"use client";

import { useState } from "react";
import { clinicApi } from "@/lib/api/clinic.api";
import { Button } from "@/components/ui/button";

interface PrescriptionItem {
  maSp: string;
  soLuong: number;
}

export default function PrescriptionPage() {
  const [form, setForm] = useState({
    maHoSo: "",
    maNs: "",
    danhSachKeDon: [] as PrescriptionItem[],
  });

  const addRow = () => {
    setForm({
      ...form,
      danhSachKeDon: [...form.danhSachKeDon, { maSp: "", soLuong: 1 }],
    });
  };

  const handleSubmit = async () => {
    await clinicApi.createPhieuKeDon(form);
  };

  return (
    <div>
      <h1>Kê đơn</h1>

      <Button onClick={addRow}>+ Thuốc</Button>

      {form.danhSachKeDon.map((row, i) => (
        <input key={i} placeholder="Mã SP" onChange={(e) => {
          const list = [...form.danhSachKeDon];
          list[i].maSp = e.target.value;
          setForm({ ...form, danhSachKeDon: list });
        }} />
      ))}

      <Button onClick={handleSubmit}>Tạo đơn</Button>
    </div>
  );
}