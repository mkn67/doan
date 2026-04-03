package com.kada.da.Dto.Response;

import com.kada.da.Entity.LichHen;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LichHenResponseDTO {

    private String maLichHen;
    private String tenKhachHang;
    private String sdtKhachHang;
    private String tenBacSi;
    private LocalDate ngayHen;
    private LocalTime gioHen;
    private String trangThai;
    private String trieuChung;
    private String ghiChu;

    public LichHenResponseDTO(LichHen lichHen) {
        this.maLichHen = lichHen.getMaLichHen();
        this.ngayHen = lichHen.getNgayHen();
        this.gioHen = lichHen.getGioHen();
        this.trangThai = lichHen.getTrangThai();
        this.trieuChung = lichHen.getTrieuChung();
        this.ghiChu = lichHen.getGhiChu();
        if (lichHen.getKhachHang() != null) {
            this.tenKhachHang = lichHen.getKhachHang().getHoTen();
            this.sdtKhachHang = lichHen.getKhachHang().getSoDienThoai();
        }

        if (lichHen.getNhanSu() != null) {
            this.tenBacSi = lichHen.getNhanSu().getHoTen();
        }
    }
}