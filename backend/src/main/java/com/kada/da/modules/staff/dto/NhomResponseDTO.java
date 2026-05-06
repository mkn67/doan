package com.kada.da.modules.staff.dto;

import com.kada.da.modules.auth.dto.VaiTroResponseDTO;
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