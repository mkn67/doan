package com.kada.da.Dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class NhaCungCapRequestDTO {
    @NotBlank(message = "Tên nhà cung cấp không được để trống")
    private String tenNcc;

    @NotBlank(message = "Số điện thoại là bắt buộc")
    private String sdt;

    private String email;
    private String diaChi;
    private String nguoiLienHe; // Tên sale/đại diện bên nhà cung cấp
}