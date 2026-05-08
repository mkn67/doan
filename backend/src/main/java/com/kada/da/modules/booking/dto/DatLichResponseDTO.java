package com.kada.da.modules.booking.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate ngayHen;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime gioHen;

    private String trangThai;
    private String thongBao;
}
