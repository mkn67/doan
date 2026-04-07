package com.kada.da.Dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class GoiKhamRequestDTO {
    @NotBlank(message = "Tên gói khám không được để trống")
    private String tenGoi;

    @NotNull(message = "Giá gói là bắt buộc")
    @Positive(message = "Giá gói phải lớn hơn 0")
    private BigDecimal giaGoi;

    private String moTa;

    @NotEmpty(message = "Gói khám phải chứa ít nhất một dịch vụ")
    private List<String> danhSachMaDv; // Danh sách mã các dịch vụ nằm trong gói này
}