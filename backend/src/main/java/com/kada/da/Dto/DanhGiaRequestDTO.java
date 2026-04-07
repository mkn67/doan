package com.kada.da.Dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DanhGiaRequestDTO {
    @NotBlank(message = "Mã hồ sơ khám không được để trống")
    private String maHoSo;

    @NotBlank(message = "Mã khách hàng không được để trống")
    private String maKh;

    private String maNs; // Mã bác sĩ hoặc nhân viên phục vụ (để biết ai bị chê/khen)

    @NotNull(message = "Số sao đánh giá không được để trống")
    @Min(value = 1, message = "Số sao tối thiểu là 1")
    @Max(value = 5, message = "Số sao tối đa là 5")
    private Integer soSao;

    private String noiDung; // Nhận xét chung

    /**
     * Dữ liệu JSON chi tiết (Cái này là điểm cộng kiến thức CSDL).
     * Ví dụ Frontend gửi lên: {"thai_do": 5, "chuyen_mon": 4, "ve_sinh": 5}
     */
    private String phanHoiChiTiet;
}