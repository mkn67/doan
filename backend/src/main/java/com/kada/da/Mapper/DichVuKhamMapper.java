package com.kada.da.Mapper;

import com.kada.da.Dto.DichVuKhamRequestDTO;
import com.kada.da.Dto.Response.DichVuKhamResponseDTO;
import com.kada.da.Entity.DichVuKham;

public class DichVuKhamMapper {

    /**
     * Chuyển từ DichVuKhamRequestDTO sang DichVuKham entity.
     * Lưu ý: Mã dịch vụ (maDv) và isActive sẽ được xử lý trong service.
     */
    public static DichVuKham toEntity(DichVuKhamRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        return DichVuKham.builder()
                .tenDv(dto.getTenDv())
                .gia(dto.getGiaDv())
                .moTa(dto.getMoTa())
                .isActive(1) // Mặc định là hoạt động
                .build();
    }

    /**
     * Chuyển từ DichVuKham entity sang DichVuKhamResponseDTO.
     */
    public static DichVuKhamResponseDTO toResponse(DichVuKham entity) {
        if (entity == null) {
            return null;
        }
        return DichVuKhamResponseDTO.builder()
                .maDv(entity.getMaDv())
                .tenDv(entity.getTenDv())
                .giaDv(entity.getGia())
                .moTa(entity.getMoTa())
                .build();
    }
}