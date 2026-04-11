package com.kada.da.Mapper;

import com.kada.da.Dto.VaiTroRequestDTO;
import com.kada.da.Dto.Response.VaiTroResponseDTO;
import com.kada.da.Entity.VaiTro;

public class VaiTroMapper {

    public static VaiTro toEntity(VaiTroRequestDTO dto) {
        if (dto == null)
            return null;
        return VaiTro.builder()
                .maVaiTro(dto.getMaVaiTro())
                .tenVaiTro(dto.getTenVaiTro())
                .moTa(dto.getMoTa())
                .build();
    }

    public static VaiTroResponseDTO toResponse(VaiTro entity) {
        if (entity == null)
            return null;
        return VaiTroResponseDTO.builder()
                .maVaiTro(entity.getMaVaiTro())
                .tenVaiTro(entity.getTenVaiTro())
                .moTa(entity.getMoTa())
                .build();
    }
}