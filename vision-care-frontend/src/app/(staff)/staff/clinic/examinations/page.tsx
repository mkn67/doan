"use client";

import { useState } from "react";
import { useCreateHoSoKham } from "@/hooks/useClinic";
import { Button } from "@/components/ui/button";

export default function ExaminationPage() {
  const mutation = useCreateHoSoKham();

  const [form, setForm] = useState({
    makh: "",
    mans: "",
    matTraiSph: 0,
    matPhaiSph: 0,
    pd: 0,
  });

  const handleSubmit = () => {
    mutation.mutate(form as any);
  };

  return (
    <div>
      <h1>Khám bệnh</h1>

      <input placeholder="Mã KH" onChange={(e) => setForm({ ...form, makh: e.target.value })} />
      <input placeholder="Mã bác sĩ" onChange={(e) => setForm({ ...form, mans: e.target.value })} />

      <Button onClick={handleSubmit}>Lưu</Button>
    </div>
  );
}