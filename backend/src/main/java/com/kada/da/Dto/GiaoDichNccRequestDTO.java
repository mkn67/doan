package com.kada.da.Dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class GiaoDichNccRequestDTO {
    @NotBlank(message = "Mã nhà cung cấp là bắt buộc")
    private String maNcc;

    private String maPn; // Null nếu là tạm ứng, có mã nếu thanh toán cho 1 Phiếu nhập cụ thể

    @NotNull(message = "Số tiền không được để trống")
    @Positive(message = "Số tiền phải > 0")
    private BigDecimal soTien;

    @NotBlank(message = "Loại giao dịch là bắt buộc")
    private String loaiGiaoDich; // "THANH_TOAN_NO", "TAM_UNG", "HOAN_TIEN"

    private String hinhThucThanhToan; // "CHUYEN_KHOAN", "TIEN_MAT"
    private String ghiChu;
}