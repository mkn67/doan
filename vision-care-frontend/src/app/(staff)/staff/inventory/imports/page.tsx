"use client";

import { useState } from "react";
import { useCreatePhieuNhap, useDanhSachPhieuNhap } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";

interface LoHang {
  maSp: string;
  soLuongNhap: number;
  giaNhap: number;
}

interface PhieuNhapForm {
  maNcc: string;
  maNs: string;
  loHangList: LoHang[];
}

export default function ImportsPage() {
  const { data } = useDanhSachPhieuNhap();
  const createMutation = useCreatePhieuNhap();

  const [form, setForm] = useState<PhieuNhapForm>({
    maNcc: "",
    maNs: "",
    loHangList: [],
  });

  const addRow = () => {
    setForm({
      ...form,
      loHangList: [...form.loHangList, { maSp: "", soLuongNhap: 0, giaNhap: 0 }],
    });
  };

  const handleSubmit = () => {
    createMutation.mutate(form);
  };

  return (
    <div>
      <h1>Phiếu nhập</h1>

      <Button onClick={addRow}>+ Thêm dòng</Button>

      {form.loHangList.map((row, index) => (
        <div key={index}>
          <input placeholder="Mã SP" onChange={(e) => {
            const newList = [...form.loHangList];
            newList[index].maSp = e.target.value;
            setForm({ ...form, loHangList: newList });
          }} />
        </div>
      ))}

      <Button onClick={handleSubmit}>Tạo phiếu</Button>

      <table>
        <tbody>
          {data?.map((pn) => (
            <tr key={pn.maPn}>
              <td>{pn.maPn}</td>
              <td>{pn.tenNcc}</td>
              <td>{pn.tongTien}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}