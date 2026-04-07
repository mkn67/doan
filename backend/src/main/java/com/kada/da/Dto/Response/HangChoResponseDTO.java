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
public class HangChoResponseDTO {
    private String maHangCho;
    private Integer soThuTu;
    private String tenKhachHang;
    private String tenBacSi;
    private String trangThai;
    private LocalDateTime thoiGianBatDauCho;
    private Long thoiGianChoDoiPhut;
}