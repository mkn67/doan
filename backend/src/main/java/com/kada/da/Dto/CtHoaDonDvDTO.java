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
public class CtHoaDonDvDTO {
    @NotBlank(message = "Mã dịch vụ không được để trống")
    private String maDv;

    @NotNull(message = "Số lượng dịch vụ là bắt buộc")
    @Min(value = 1, message = "Số lượng dịch vụ phải từ 1 trở lên")
    private Integer soLuong; // Thường là 1, nhưng có thể nhiều hơn nếu tính theo số mắt/số lần

    @NotNull(message = "Đơn giá dịch vụ là bắt buộc")
    private BigDecimal donGia;

    private String ghiChu; // Ví dụ: "Khám ngoài giờ", "Ưu tiên"
}