"use client";

import { useState } from "react";
import { useDanhSachSanPham, useCreateSanPham } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProductsPage() {
  const { data, isLoading } = useDanhSachSanPham();
  const createMutation = useCreateSanPham();

  const [form, setForm] = useState({
    tenSp: "",
    maLoai: "",
    giaBan: 0,
    laThuoc: false,
  });

  const handleSubmit = () => {
    createMutation.mutate(form as any);
  };

  return (
    <div>
      <h1>Quản lý sản phẩm</h1>

      <div>
        <Input placeholder="Tên" onChange={(e) => setForm({ ...form, tenSp: e.target.value })} />
        <Input placeholder="Mã loại" onChange={(e) => setForm({ ...form, maLoai: e.target.value })} />
        <Input type="number" placeholder="Giá" onChange={(e) => setForm({ ...form, giaBan: Number(e.target.value) })} />
        <Button onClick={handleSubmit}>Thêm</Button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Tên</th>
            <th>Loại</th>
            <th>Giá</th>
            <th>Tồn</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((sp) => (
            <tr key={sp.maSp}>
              <td>{sp.tenSp}</td>
              <td>{sp.tenLoai}</td>
              <td>{sp.giaBan}</td>
              <td>{sp.tongTonKho}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}