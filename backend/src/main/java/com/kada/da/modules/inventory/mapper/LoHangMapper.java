package com.kada.da.modules.inventory.mapper;

import com.kada.da.modules.inventory.dto.LoHangRequestDTO;
import com.kada.da.modules.inventory.dto.LoHangResponseDTO;
import com.kada.da.modules.inventory.domain.LoHang;

public class LoHangMapper {

    public static LoHang toEntity(LoHangRequestDTO dto) {
        if (dto == null)
            return null;
        return LoHang.builder()
                .ngaySanXuat(dto.getNgaySanXuat())
                .ngayHetHan(dto.getNgayHetHan())
                .soLuongNhap(dto.getSoLuongNhap())
                .giaNhap(dto.getGiaNhap())
                .build();
    }

    public static LoHangResponseDTO toResponse(LoHang entity) {
        if (entity == null)
            return null;
        String tenSanPham = entity.getSanPham() != null ? entity.getSanPham().getTenSp() : null;
        String trangThai = "Con han";
        if (entity.getNgayHetHan() != null) {
            long soNgayConLai = java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(), entity.getNgayHetHan());
            if (soNgayConLai <= 0) {
                trangThai = "Het han";
            } else if (soNgayConLai <= 30) {
                trangThai = "Sap het han";
            }
        }
        return LoHangResponseDTO.builder()
                .maLo(entity.getMaLo())
                .maSp(entity.getSanPham() != null ? entity.getSanPham().getMaSp() : null)
                .tenSanPham(tenSanPham)
                .soLuongNhap(entity.getSoLuongNhap())
                .soLuongTon(entity.getSoLuongTon())
                .giaNhap(entity.getGiaNhap())
                .ngaySanXuat(entity.getNgaySanXuat())
                .ngayHetHan(entity.getNgayHetHan())
                .trangThaiHsd(trangThai)
                .build();
    }
}