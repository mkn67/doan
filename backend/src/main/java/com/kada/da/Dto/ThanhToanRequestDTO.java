package com.kada.da.Dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ThanhToanRequestDTO {
    @NotBlank(message = "Mã hóa đơn là bắt buộc")
    private String maHd;
    @NotBlank(message = "Mã nhân viên thu ngân không được để trống")
    private String maNs;

    @NotNull(message = "Số tiền thanh toán không được để trống")
    @Positive(message = "Số tiền phải lớn hơn 0")
    private BigDecimal soTien;

    @NotBlank(message = "Vui lòng chọn hình thức thanh toán")
    private String hinhThucThanhToan;

    private String ghiChu;
}