package com.kada.da.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class XuLyKinhRequestDTO {

    @NotBlank(message = "Mã hồ sơ thị lực không được để trống")
    private String maHoSo;

    @NotBlank(message = "Mã hóa đơn không được để trống")
    private String maHd;

    @NotBlank(message = "Vui lòng chọn nhân sự kỹ thuật")
    private String maNsKyThuat;

    private String ghiChu;
}