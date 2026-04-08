package com.kada.da.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class XuLyKinhRequestDTO {

    @NotBlank(message = "Mã hóa đơn không được để trống")
    private String maDon;

    private String maHoso; // Hồ sơ thị lực (có thể null nếu không có)

    private String maNsKyThuat; // Kỹ thuật viên (có thể null nếu chưa phân công)

    @NotNull(message = "Ngày hẹn trả không được để trống")
    private LocalDateTime ngayHenTra;

    private String ghiChu;
    private Object thongSoKinh;
}