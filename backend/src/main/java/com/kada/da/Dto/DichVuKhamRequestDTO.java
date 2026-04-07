package com.kada.da.Dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class DichVuKhamRequestDTO {
    private String maDv; // Dùng khi cập nhật

    @NotBlank(message = "Tên dịch vụ không được để trống")
    private String tenDv;

    @NotNull(message = "Giá dịch vụ là bắt buộc")
    @Positive(message = "Giá dịch vụ phải lớn hơn 0")
    private BigDecimal giaDv;

    private String moTa;
}