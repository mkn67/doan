package com.kada.da.Mapper;

import com.kada.da.Dto.XuLyKinhRequestDTO;
import com.kada.da.Dto.Response.XuLyKinhResponseDTO;
import com.kada.da.Entity.XuLyKinh;

public class XuLyKinhMapper {

    /**
     * Chuyển từ RequestDTO sang Entity.
     * Lưu ý: maXl, phieuKeDon, nhanSuKyThuat, ngayBatDau, ngayHoanThanh sẽ được set
     * trong service.
     * Trạng thái mặc định là "Chờ xử lý".
     */
    public static XuLyKinh toEntity(XuLyKinhRequestDTO dto) {
        if (dto == null)
            return null;
        return XuLyKinh.builder()
                .thongSoKinh(dto.getThongSoKinh() != null ? dto.getThongSoKinh().toString() : null)
                .trangThai("Chờ xử lý")
                .ghiChu(dto.getGhiChu())
                .build();
    }

    /**
     * Chuyển từ Entity sang ResponseDTO.
     * Các thông tin maDon, maHoso, tenKhachHang, tenKyThuatVien được lấy từ quan
     * hệ.
     * Ngày nhận (ngayNhan) tạm lấy từ ngayBatDau của entity (nếu có).
     * Ngày hẹn trả (ngayHenTra) hiện không có trong entity, để null.
     */
    public static XuLyKinhResponseDTO toResponse(XuLyKinh entity) {
        if (entity == null)
            return null;

        // Lấy maDon từ phieuKeDon
        String maDon = entity.getPhieuKeDon() != null ? entity.getPhieuKeDon().getMaDon() : null;

        // Lấy maHoso và tenKhachHang thông qua phieuKeDon -> hoSoThiLuc -> khachHang
        String maHoso = null;
        String tenKhachHang = null;
        if (entity.getPhieuKeDon() != null && entity.getPhieuKeDon().getHoSoThiLuc() != null) {
            maHoso = entity.getPhieuKeDon().getHoSoThiLuc().getMaHoSo();
            if (entity.getPhieuKeDon().getHoSoThiLuc().getKhachHang() != null) {
                tenKhachHang = entity.getPhieuKeDon().getHoSoThiLuc().getKhachHang().getHoTen();
            }
        }

        // Lấy tên kỹ thuật viên
        String tenKyThuatVien = entity.getNhanSuKyThuat() != null ? entity.getNhanSuKyThuat().getHoTen() : null;

        // Ngày nhận tạm lấy ngayBatDau (có thể null)
        java.time.LocalDateTime ngayNhan = entity.getNgayBatDau();

        return XuLyKinhResponseDTO.builder()
                .maXl(entity.getMaXl())
                .maDon(maDon)
                .maHoso(maHoso)
                .tenKhachHang(tenKhachHang)
                .tenKyThuatVien(tenKyThuatVien)
                .tinhTrang(entity.getTrangThai())
                .ngayNhan(ngayNhan)
                .ngayHenTra(null)
                .ghiChu(entity.getGhiChu())
                .thongSoKinh(entity.getThongSoKinh())
                .build();
    }
}