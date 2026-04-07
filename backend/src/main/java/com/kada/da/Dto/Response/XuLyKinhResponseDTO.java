package com.kada.da.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class XuLyKinhResponseDTO {
    private String maXlk;
    private String tenKhachHang;
    private String tenKyThuatVien;
    private String thongSoMatPhai;
    private String thongSoMatTrai;
    private String tinhTrang;
    private LocalDateTime ngayHenTra;
}