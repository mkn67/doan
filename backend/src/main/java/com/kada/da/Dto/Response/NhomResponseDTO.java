package com.kada.da.Dto.Response;

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