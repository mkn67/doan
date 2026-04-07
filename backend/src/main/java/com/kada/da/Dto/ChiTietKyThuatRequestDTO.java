package com.kada.da.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChiTietKyThuatRequestDTO {
    @NotBlank(message = "Mã nhân sự là bắt buộc")
    private String maNs;

    @NotBlank(message = "Tên kỹ năng/chứng chỉ không được trống")
    private String tenKyThuat; // VD: "Sử dụng máy đo khúc xạ tự động", "Chứng chỉ mài lắp kính"

    @NotBlank(message = "Trình độ không được để trống")
    private String trinhDo; // VD: "Cơ bản", "Thành thạo", "Chuyên gia"

    private String donViCap; // VD: "Bệnh viện Mắt TP.HCM"
    private String moTaThanhTich;
}