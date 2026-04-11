package com.kada.da.Mapper;

import com.kada.da.Dto.ThanhToanRequestDTO;
import com.kada.da.Dto.Response.ThanhToanResponseDTO;
import com.kada.da.Entity.ThanhToan;

import java.time.LocalDateTime;

public class ThanhToanMapper {

    public static ThanhToan toEntity(ThanhToanRequestDTO dto) {
        if (dto == null)
            return null;
        return ThanhToan.builder()
                .soTien(dto.getSoTien())
                .phuongThuc(dto.getHinhThucThanhToan())
                .trangThai("Hoàn thành") // mặc định
                .ngayThanhToan(LocalDateTime.now())
                // .ghiChu(dto.getGhiChu()) // không có trong entity, có thể bỏ qua
                .build();
    }

    public static ThanhToanResponseDTO toResponse(ThanhToan entity) {
        if (entity == null)
            return null;
        String maHd = entity.getHoaDon() != null ? entity.getHoaDon().getMaHd() : null;
        String tenNhanVien = entity.getNhanSu() != null ? entity.getNhanSu().getHoTen() : null;
        return ThanhToanResponseDTO.builder()
                .maGiaoDich(entity.getMaTt())
                .maHd(maHd)
                .tenNhanVienThuNgan(tenNhanVien)
                .ngayThanhToan(entity.getNgayThanhToan())
                .soTien(entity.getSoTien())
                .hinhThucThanhToan(entity.getPhuongThuc())
                // tienConNo, thongBao sẽ do service tính
                .build();
    }
}