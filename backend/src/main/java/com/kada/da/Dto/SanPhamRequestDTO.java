package com.kada.da.Dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class SanPhamRequestDTO {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String tenSp;

    @NotBlank(message = "Phải chọn loại sản phẩm")
    private String maLoai; // Ví dụ: Gọng kính, Tròng kính, Thuốc

    @NotNull(message = "Giá bán không được để trống")
    @Min(value = 0, message = "Giá bán không được âm")
    private BigDecimal giaBan;

    private String moTa;

    private String hinhAnh; // URL hoặc Base64 ảnh

    @NotNull(message = "Phải xác định đây có phải là thuốc không")
    private Boolean laThuoc; // true = Thuốc (Cần quản lý HSD gắt gao), false = Kính
}