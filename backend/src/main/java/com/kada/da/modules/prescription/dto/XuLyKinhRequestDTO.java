package com.kada.da.modules.prescription.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class XuLyKinhRequestDTO {

    @NotBlank(message = "Mã hóa đơn/Mã đơn không được để trống")
    private String maDon;

    private String maNsKyThuat;

    @NotBlank(message = "Trạng thái không được để trống")
    private String trangThai;

    private LocalDateTime ngayHoanThanh;

    private String ghiChu;

    private Object thongSoKinh;
}
