"use client";

import { useState } from "react";
import { useDanhSachNhaCungCap, useCreateNhaCungCap } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SuppliersPage() {
  const { data } = useDanhSachNhaCungCap();
  const createMutation = useCreateNhaCungCap();

  const [form, setForm] = useState<{ tenNcc: string; sdt: string }>({
    tenNcc: "",
    sdt: "",
  });

  const handleSubmit = () => {
    createMutation.mutate(form);
  };

  return (
    <div>
      <h1>Nhà cung cấp</h1>

      <Input placeholder="Tên NCC" onChange={(e) => setForm({ ...form, tenNcc: e.target.value })} />
      <Input placeholder="SĐT" onChange={(e) => setForm({ ...form, sdt: e.target.value })} />
      <Button onClick={handleSubmit}>Thêm</Button>

      <table>
        <tbody>
          {data?.map((ncc) => (
            <tr key={ncc.maNcc}>
              <td>{ncc.tenNcc}</td>
              <td>{ncc.sdt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}