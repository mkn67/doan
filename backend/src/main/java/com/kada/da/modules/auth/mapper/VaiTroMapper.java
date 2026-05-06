package com.kada.da.modules.auth.mapper;

import com.kada.da.modules.auth.dto.VaiTroRequestDTO;
import com.kada.da.modules.auth.dto.VaiTroResponseDTO;
import com.kada.da.modules.auth.domain.VaiTro;

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