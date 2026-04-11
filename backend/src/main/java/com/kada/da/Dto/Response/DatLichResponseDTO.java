package com.kada.da.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatLichResponseDTO {
    private String maLh;
    private String maKhachHang;
    private String tenKhachHang;
    private String maBacSi;
    private String tenBacSi;
    private LocalDate ngayHen;
    private LocalDateTime gioHen;
    private String trangThai;
    private String thongBao; // Ví dụ: "Đặt lịch thành công"
}