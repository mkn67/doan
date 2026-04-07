package com.kada.da.Dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class LoHangRequestDTO {
    @NotBlank(message = "Mã sản phẩm không được để trống")
    private String maSp;

    @NotNull(message = "Số lượng nhập không được để trống")
    @Min(value = 1, message = "Số lượng nhập phải lớn hơn 0")
    private Integer soLuongNhap;

    @NotNull(message = "Giá nhập không được để trống")
    @Min(value = 0, message = "Giá nhập không được âm")
    private BigDecimal giaNhap;

    private LocalDate ngaySanXuat;
    private LocalDate ngayHetHan;
}