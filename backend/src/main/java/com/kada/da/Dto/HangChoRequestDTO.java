package com.kada.da.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HangChoRequestDTO {
    @NotBlank(message = "Mã khách hàng không được để trống")
    private String maKh;

    private String maLh;

    private String maNs;

    private String loaiKham;

    private String ghiChu;
}