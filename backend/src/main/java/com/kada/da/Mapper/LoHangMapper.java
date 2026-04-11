package com.kada.da.Mapper;

import com.kada.da.Dto.LoHangRequestDTO;
import com.kada.da.Dto.Response.LoHangResponseDTO;
import com.kada.da.Entity.LoHang;

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
        return LoHangResponseDTO.builder()
                .maLo(entity.getMaLo())
                .maSp(entity.getSanPham() != null ? entity.getSanPham().getMaSp() : null)
                .tenSanPham(tenSanPham)
                .soLuongNhap(entity.getSoLuongNhap())
                .soLuongTon(entity.getSoLuongTon())
                .giaNhap(entity.getGiaNhap())
                .ngaySanXuat(entity.getNgaySanXuat())
                .ngayHetHan(entity.getNgayHetHan())
                .build();
    }
}