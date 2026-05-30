package com.kada.da.modules.billing.dto;

import java.math.BigDecimal; // Thêm import này

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class ThanhToanRequestDTO {

    @NotBlank(message = "Mã hóa đơn là bắt buộc")
    @JsonProperty("maHd")
    private String maHd;

    @NotBlank(message = "Mã nhân viên không được để trống")
    @JsonProperty("maNs")
    private String maNs;

    @NotNull(message = "Số tiền thanh toán không được để trống")
    @PositiveOrZero(message = "Số tiền không được âm")
    private BigDecimal soTien;

    @NotBlank(message = "Vui lòng chọn hình thức thanh toán")
    @JsonProperty("hinhThucThanhToan")
    private String hinhThucThanhToan;

    private String ghiChu;
}
