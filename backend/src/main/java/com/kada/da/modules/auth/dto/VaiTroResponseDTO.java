package com.kada.da.modules.auth.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VaiTroResponseDTO {
    private String maVaiTro;
    private String tenVaiTro;
    private String moTa;
}