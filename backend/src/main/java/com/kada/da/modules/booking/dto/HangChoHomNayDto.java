package com.kada.da.modules.booking.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class HangChoHomNayDto {
    private String maHc;
    private String maKh;
    private Integer soThuTu;
    private String loaiKhach;
    private String tenKhach;
    private String sdt;
    private String tenBacSi;
    private String goiKham;
    private String trangThai;
    private LocalDateTime gioDangKy;
    private Long phutCho; // Java sẽ tự tính cái này
}