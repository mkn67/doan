package com.kada.da.Mapper;

import com.kada.da.Dto.LichLamViecRequestDTO;
import com.kada.da.Dto.Response.LichLamViecResponseDTO;
import com.kada.da.Entity.LichLamViec;

public class LichLamViecMapper {

    /**
     * Chuyển từ RequestDTO sang Entity.
     * Lưu ý: maLlv và nhanSu sẽ được set trong service.
     */
    public static LichLamViec toEntity(LichLamViecRequestDTO dto) {
        if (dto == null)
            return null;
        return LichLamViec.builder()
                .ngayLam(dto.getNgayLam())
                .gioBatDau(dto.getGioBatDau())
                .gioKetThuc(dto.getGioKetThuc())
                .isNghi(dto.getIsNghi() != null ? dto.getIsNghi() : 0)
                .build();
    }

    /**
     * Chuyển từ Entity sang ResponseDTO.
     */
    public static LichLamViecResponseDTO toResponse(LichLamViec entity) {
        if (entity == null)
            return null;
        String tenNhanSu = entity.getNhanSu() != null ? entity.getNhanSu().getHoTen() : null;
        String chucVu = (entity.getNhanSu() != null && entity.getNhanSu().getChucVu() != null)
                ? entity.getNhanSu().getChucVu().getTenCv()
                : null;
        return LichLamViecResponseDTO.builder()
                .maLlv(entity.getMaLlv())
                .tenNhanSu(tenNhanSu)
                .chucVu(chucVu)
                .ngayLam(entity.getNgayLam())
                .gioBatDau(entity.getGioBatDau())
                .gioKetThuc(entity.getGioKetThuc())
                .isNghi(entity.getIsNghi())
                .build();
    }
}