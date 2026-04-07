package com.kada.da.Dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CtHoaDonDTO {
    @NotBlank(message = "Mã lô hàng không được để trống")
    private String maLo; // Phải có mã lô để trừ kho chính xác

    @NotNull(message = "Số lượng sản phẩm là bắt buộc")
    @Min(value = 1, message = "Số lượng phải từ 1 trở lên")
    private Integer soLuong;

    @NotNull(message = "Đơn giá sản phẩm không được để trống")
    private BigDecimal donGia;

    private Double chietKhau; // % giảm giá riêng cho sản phẩm này (nếu có)
}