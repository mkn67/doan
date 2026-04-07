package com.kada.da.Dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class NhanSuRequestDTO {
    private String maNs; // Null khi thêm mới

    @NotBlank(message = "Họ tên nhân sự không được để trống")
    private String hoTen;

    @NotBlank(message = "Số điện thoại là bắt buộc")
    @Pattern(regexp = "^(0|\\+84)(\\s|\\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\\d)(\\s|\\.)?(\\d{3})(\\s|\\.)?(\\d{3})$", message = "Số điện thoại không đúng định dạng Việt Nam")
    private String sdt;

    @Email(message = "Email không hợp lệ")
    private String email;

    private String diaChi;
    private LocalDate ngaySinh;
    private String gioiTinh;
    private String cccd;
    @NotBlank(message = "Phải chỉ định chức vụ cho nhân sự")
    private String maChucVu; // Ví dụ: CV01 (Bác sĩ), CV02 (Lễ tân)
}