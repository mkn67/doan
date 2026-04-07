package com.kada.da.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PhanQuyenRequestDTO {
    @NotBlank(message = "Mã tài khoản không được để trống")
    private String maTk;

    @NotBlank(message = "Mã nhóm quyền không được để trống")
    private String maNhom;
}