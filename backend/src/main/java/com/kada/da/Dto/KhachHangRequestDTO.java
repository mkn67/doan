package com.kada.da.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class KhachHangRequestDTO {
    @NotBlank(message = "Họ tên khách hàng là bắt buộc")
    @Size(max = 100)
    private String hoTen;

    @NotBlank(message = "Số điện thoại là bắt buộc")
    @Pattern(regexp = "^(0|\\+84)(\\s|\\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\\d)(\\s|\\.)?(\\d{3})(\\s|\\.)?(\\d{3})$", message = "Số điện thoại không đúng định dạng Việt Nam")
    private String sdt;

    private String diaChi;
    private String email;
    private String ghiChu;
}