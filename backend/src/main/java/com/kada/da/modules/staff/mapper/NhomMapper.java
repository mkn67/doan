package com.kada.da.modules.auth.mapper;

import com.kada.da.modules.auth.dto.NhomRequestDTO;
import com.kada.da.modules.auth.dto.NhomResponseDTO;
import com.kada.da.modules.staff.domain.Nhom;
import com.kada.da.modules.auth.dto.VaiTroResponseDTO;

import java.util.stream.Collectors;

public class NhomMapper {

    public static Nhom toEntity(NhomRequestDTO dto) {
        if (dto == null)
            return null;
        return Nhom.builder()
                .tenNhom(dto.getTenNhom())
                .moTa(dto.getMoTa())
                // Không set vaiTros, danhSachTaiKhoan ở đây
                .build();
    }

    public static NhomResponseDTO toResponse(Nhom entity) {
        if (entity == null)
            return null;
        return NhomResponseDTO.builder()
                .maNhom(entity.getMaNhom())
                .tenNhom(entity.getTenNhom())
                .moTa(entity.getMoTa())
                .danhSachVaiTro(entity.getVaiTros() == null ? null
                        : entity.getVaiTros().stream()
                                .map(vt -> VaiTroResponseDTO.builder()
                                        .maVaiTro(vt.getMaVaiTro())
                                        .tenVaiTro(vt.getTenVaiTro())
                                        .moTa(vt.getMoTa())
                                        .build())
                                .collect(Collectors.toList()))
                .build();
    }
}