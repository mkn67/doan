"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { PlusCircle, Search, Stethoscope, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import axiosClient from '@/lib/axios';
import { 
  SanPhamRequest, SanPhamResponse, 
  LoHangRequest, LoHangResponse, 
  PhieuNhapRequest, PhieuNhapResponse, 
  NhaCungCapRequest, NhaCungCapResponse, 
  GiaoDichNccRequest, GiaoDichNccResponse, 
  ThongKeSanPham, CanhBaoHetHan, 
  CanhBaoTonKhoDto, 
  PageResponseDTO 
} from '@/types/inventory';
import { 
  HoSoKhamRequest, HoSoKhamResponse, 
  PhieuKeDonRequest, PhieuKeDonResponse, 
  DichVuKhamRequest, DichVuKhamResponse, 
  GoiKhamRequest, GoiKhamResponse, 
  DanhGiaRequest, DanhGiaResponse, 
  ChiTietKyThuatRequest, ChiTietKyThuatResponse, 
  DatLichRequest, DatLichResponse 
} from '@/types/clinic';

const CLINIC_BASE_URL = '/clinic';

export const clinicApi = {
  createHoSoKham: async (data: HoSoKhamRequest): Promise<HoSoKhamResponse> => {
    const response = await axiosClient.post(`${CLINIC_BASE_URL}/hoso`, data);
    return response.data;
  },
  getHoSoKham: async (maHoSo: string): Promise<HoSoKhamResponse> => {
    const response = await axiosClient.get(`${CLINIC_BASE_URL}/hoso/${maHoSo}`);
    return response.data;
  },
  createPhieuKeDon: async (data: PhieuKeDonRequest): Promise<PhieuKeDonResponse> => {
    const response = await axiosClient.post(`${CLINIC_BASE_URL}/kedon`, data);
    return response.data;
  },
  getDichVu: async (): Promise<DichVuKhamResponse[]> => {
    const response = await axiosClient.get(`/dich-vu-kham`);
    return response.data;
  },
  createDichVu: async (data: DichVuKhamRequest): Promise<DichVuKhamResponse> => {
    const response = await axiosClient.post(`/dich-vu-kham`, data);
    return response.data;
  },
  createGoiKham: async (data: GoiKhamRequest): Promise<GoiKhamResponse> => {
    const response = await axiosClient.post(`${CLINIC_BASE_URL}/goikham`, data);
    return response.data;
  },
  createDanhGia: async (data: DanhGiaRequest): Promise<DanhGiaResponse> => {
    const response = await axiosClient.post(`${CLINIC_BASE_URL}/danhgia`, data);
    return response.data;
  },
  createChiTietKyThuat: async (data: ChiTietKyThuatRequest): Promise<ChiTietKyThuatResponse> => {
    const response = await axiosClient.post(`${CLINIC_BASE_URL}/kythuat`, data);
    return response.data;
  },
  datLich: async (data: DatLichRequest): Promise<DatLichResponse> => {
    const response = await axiosClient.post("/bookings/dat-lich", data);
    return response.data;
  },
  goiVaoKham: async (maHc: string): Promise<string> => {
    const response = await axiosClient.put(`/hang-cho/${maHc}/goi-kham`);
    return response.data;
  },
  ketThucKham: async (maHc: string, trangThai: 'Hoàn thành' | 'Bỏ về'): Promise<string> => {
    const response = await axiosClient.put(`/hang-cho/${maHc}/ket-thuc`, null, { params: { trangThai } });
    return response.data;
  },
  getHangChoHomNay: async (maNs?: string) => {
    const response = await axiosClient.get(`/hang-cho/hom-nay`, { params: { maNs } });
    return response.data;
  },
};

export const inventoryApi = {
  getSanPham: async (): Promise<SanPhamResponse[]> => {
    const response = await axiosClient.get<SanPhamResponse[]>('/san-pham');
    return response.data;
  },
  createSanPham: async (data: SanPhamRequest): Promise<SanPhamResponse> => {
    const response = await axiosClient.post<SanPhamResponse>('/san-pham', data);
    return response.data;
  },
  deleteSanPham: async (maSp: string) => {
    const response = await axiosClient.delete(`/san-pham/${maSp}`);
    return response.data;
  },
  createLoHang: async (data: LoHangRequest): Promise<LoHangResponse> => {
    const response = await axiosClient.post<LoHangResponse>('/lo-hang', data);
    return response.data;
  },
  getPhieuNhap: async (page = 0, size = 10): Promise<PageResponseDTO<PhieuNhapResponse>> => {
    const response = await axiosClient.get<PageResponseDTO<PhieuNhapResponse>>(`/phieu-nhap?page=${page}&size=${size}`);
    return response.data;
  },
  createPhieuNhap: async (data: PhieuNhapRequest): Promise<PhieuNhapResponse> => {
    const response = await axiosClient.post<PhieuNhapResponse>('/phieu-nhap/nhap-kho', data);
    return response.data;
  },
  getNhaCungCap: async (page = 0, size = 10, keyword = ''): Promise<PageResponseDTO<NhaCungCapResponse>> => {
    const response = await axiosClient.get<PageResponseDTO<NhaCungCapResponse>>(
      `/nha-cung-cap?page=${page}&size=${size}${keyword ? `&keyword=${keyword}` : ''}`
    );
    return response.data;
  },
  createNhaCungCap: async (data: NhaCungCapRequest): Promise<NhaCungCapResponse> => {
    const response = await axiosClient.post<NhaCungCapResponse>('/nha-cung-cap', data);
    return response.data;
  },
  createGiaoDichNcc: async (data: GiaoDichNccRequest): Promise<GiaoDichNccResponse> => {
    const response = await axiosClient.post<GiaoDichNccResponse>('/giao-dich', data);
    return response.data;
  },
  deleteNhaCungCap: async (maNcc: string) => {
    const response = await axiosClient.delete(`/nha-cung-cap/${maNcc}`);
    return response.data;
  },
  getThongKeSanPham: async (): Promise<ThongKeSanPham[]> => {
    const response = await axiosClient.get<ThongKeSanPham[]>('/thong-ke/san-pham');
    return response.data;
  },
  getCanhBaoHetHan: async (): Promise<CanhBaoHetHan[]> => {
    const response = await axiosClient.get<CanhBaoHetHan[]>('/inventory/warnings/expiring-soon');
    return response.data;
  },
  getCanhBaoTonKho: async (nguong = 10): Promise<CanhBaoTonKhoDto[]> => {
    const response = await axiosClient.get<CanhBaoTonKhoDto[]>(`/inventory/warnings/low-stock?nguong=${nguong}`);
    return response.data;
  },
};

export default function ServicesPage() {
  const [services, setServices] = useState<SanPhamResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<SanPhamResponse | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({ tenSp: "", giaBan: 0 })

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await inventoryApi.getSanPham()
        // Lọc các sản phẩm thuộc loại dịch vụ (ví dụ: DV) hoặc hiển thị tất cả từ kho
        setServices(data)
      } catch (error) {
        console.error("Lỗi khi lấy danh mục dịch vụ:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  // Hàm format tiền VNĐ
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  const handleOpenEdit = (svc: SanPhamResponse) => {
    setSelectedService(svc)
    setEditForm({ tenSp: svc.tenSp, giaBan: svc.giaBan })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedService) return;
    try {
      // Giả sử API update dùng chung create hoặc có endpoint riêng
      // Ở đây demo cập nhật state local sau khi gọi API thành công
      setServices(services.map(s => s.maSp === selectedService.maSp ? { ...s, ...editForm } : s));
      setIsEditDialogOpen(false);
    } catch (error) { console.error(error); }
  }

  const handleDelete = async (maSp: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
      try {
        await inventoryApi.deleteSanPham(maSp);
        setServices(services.filter(s => s.maSp !== maSp));
      } catch (error) { console.error(error); }
    }
  }

  return (
    <div className="p-6 space-y-6 flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Danh mục dịch vụ</h1>
          <p className="text-sm text-slate-500">Quản lý các dịch vụ khám chữa bệnh và bảng giá.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <PlusCircle className="mr-2 h-4 w-4" /> Thêm dịch vụ
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input type="text" placeholder="Tìm tên dịch vụ..." className="pl-9 bg-white" />
        </div>
      </div>

      <div className="bg-white rounded-md border shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px] font-semibold">Mã DV</TableHead>
              <TableHead className="font-semibold">Tên dịch vụ</TableHead>
              <TableHead className="font-semibold">Nhóm dịch vụ</TableHead>
              <TableHead className="font-semibold text-right">Đơn giá</TableHead>
              <TableHead className="font-semibold text-center">Trạng thái</TableHead>
              <TableHead className="text-right font-semibold">Tùy chọn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                  Đang tải danh mục dịch vụ...
                </TableCell>
              </TableRow>
            ) : services.map((svc) => (
              <TableRow key={svc.maSp} className="hover:bg-slate-50">
                <TableCell className="font-medium text-slate-500">{svc.maSp}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 font-medium text-slate-900">
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    {svc.tenSp}
                  </div>
                </TableCell>
                <TableCell className="text-slate-600">{svc.tenLoai}</TableCell>
                <TableCell className="text-right font-semibold text-emerald-600">
                  {formatVND(svc.giaBan)}
                </TableCell>
                <TableCell className="text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    svc.tongTonKho > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {svc.tongTonKho > 0 ? 'Đang cung cấp' : 'Hết hàng/Tạm ngưng'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4 text-slate-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenEdit(svc)}>
                        <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-rose-600 focus:text-rose-600" onClick={() => handleDelete(svc.maSp)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Xóa dịch vụ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Chỉnh sửa */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa dịch vụ</DialogTitle>
            <DialogDescription>
              Thay đổi thông tin dịch vụ tại đây. Nhấn lưu để hoàn tất.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Tên DV</Label>
              <Input
                id="name"
                value={editForm.tenSp}
                onChange={(e) => setEditForm({ ...editForm, tenSp: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Giá bán</Label>
              <Input
                id="price"
                type="number"
                value={editForm.giaBan}
                onChange={(e) => setEditForm({ ...editForm, giaBan: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}