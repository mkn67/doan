package com.kada.da.Dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class XacNhanEmailDTO {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Mã xác nhận không được để trống")
    @Size(min = 6, max = 6, message = "Mã xác nhận phải gồm 6 ký tự")
    private String otpCode;
}