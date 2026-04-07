package com.kada.da.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VaiTroRequestDTO {
    @NotBlank(message = "Tên vai trò không được để trống")
    private String MaVaiTro;
    private String tenVaiTro;
    private String moTa;
}