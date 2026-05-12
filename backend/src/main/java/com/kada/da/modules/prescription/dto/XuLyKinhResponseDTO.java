package com.kada.da.modules.prescription.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class XuLyKinhResponseDTO {

    private String maXl;
    private String maDon;
    // Bỏ maHoso
    private String tenKhachHang;
    private String tenKyThuatVien;

    private String trangThai;

    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayHoanThanh;

    private String ghiChu;
    private Object thongSoKinh;
}
