package com.kada.da.modules.auth.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhomResponseDTO {
    private String maNhom;
    private String tenNhom;
    private String moTa;
    private List<VaiTroResponseDTO> danhSachVaiTro;
}