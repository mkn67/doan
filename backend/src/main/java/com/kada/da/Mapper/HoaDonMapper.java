package com.kada.da.Mapper;

import com.kada.da.Dto.HoaDonRequestDTO;
import com.kada.da.Dto.Response.HoaDonResponseDTO;
import com.kada.da.Entity.HoaDon;
import com.kada.da.Enum.TrangThaiHoaDon;

import java.time.LocalDateTime;

public class HoaDonMapper {

    /**
     * Chuyển từ HoaDonRequestDTO sang HoaDon entity.
     * Lưu ý: Các trường quan hệ (khachHang, nhanSu, hoSoThiLuc, phieuKeDon) sẽ được
     * set trong service.
     * Mã hóa đơn (maHd) cũng được sinh trong service.
     */
    public static HoaDon toEntity(HoaDonRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        return HoaDon.builder()
                .ngayLap(LocalDateTime.now())
                .tongTien(dto.getTongTienDuKien())
                .trangThai(TrangThaiHoaDon.CHUA_THANH_TOAN)
                .isDeleted(0)
                .build();
    }

    /**
     * Chuyển từ HoaDon entity sang HoaDonResponseDTO.
     * Các danh sách chi tiết (sản phẩm, dịch vụ) sẽ được set trong service,
     * vì cần truy vấn từ các bảng CT_HOA_DON và CT_HOA_DON_DV.
     */
    public static HoaDonResponseDTO toResponse(HoaDon entity) {
        if (entity == null) {
            return null;
        }

        String tenKhachHang = entity.getKhachHang() != null ? entity.getKhachHang().getHoTen() : null;
        String sdtKhachHang = entity.getKhachHang() != null ? entity.getKhachHang().getSdt() : null;
        String tenNhanVienLap = entity.getNhanSu() != null ? entity.getNhanSu().getHoTen() : null;

        return HoaDonResponseDTO.builder()
                .maHd(entity.getMaHd())
                .ngayLap(entity.getNgayLap())
                .tongTien(entity.getTongTien())
                .trangThai(entity.getTrangThai() != null ? entity.getTrangThai().name() : null)
                .tenKhachHang(tenKhachHang)
                .sdtKhachHang(sdtKhachHang)
                .tenNhanVienLap(tenNhanVienLap)
                .danhSachSanPham(null) // Sẽ được set trong service
                .danhSachDichVu(null) // Sẽ được set trong service
                .build();
    }
}