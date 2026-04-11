package com.kada.da.Mapper;

import com.kada.da.Dto.SanPhamRequestDTO;
import com.kada.da.Dto.Response.SanPhamResponseDTO;
import com.kada.da.Entity.SanPham;

public class SanPhamMapper {

    public static SanPham toEntity(SanPhamRequestDTO dto) {
        if (dto == null)
            return null;
        return SanPham.builder()
                .tenSp(dto.getTenSp())
                .giaBan(dto.getGiaBan())
                .laThuoc(dto.getLaThuoc() ? 1 : 0)
                // Các trường khác sẽ được set trong service (maSp, loaiSanPham, donViTinh,
                // tonKhoToiThieu, donViTinhKho)
                .build();
    }

    public static SanPhamResponseDTO toResponse(SanPham entity) {
        if (entity == null)
            return null;
        String tenLoai = entity.getLoaiSanPham() != null ? entity.getLoaiSanPham().getTenLoai() : null;
        // Giả sử không có NhaCungCap trong SanPham, tạm để null
        // TongTonKho cần tính từ LoHang, để service xử lý
        // TrangThai cần lấy từ enum, để service set
        return SanPhamResponseDTO.builder()
                .maSp(entity.getMaSp())
                .tenSp(entity.getTenSp())
                .tenLoai(tenLoai)
                .giaBan(entity.getGiaBan())
                .laThuoc(entity.getLaThuoc() == 1)
                .build();
    }
}