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

    private String maLh;
    private String tenKhachHang;
    private String sdtKhachHang;
    private String tenBacSi;
    private LocalDate ngayHen;
    private LocalTime gioHen;
    private String loaiLich;
    private String trangThai;
    private String trieuChung;

    public LichHenResponseDTO(LichHen lichHen) {
        this.maLh = lichHen.getMaLh(); // Đã sửa thành maLh

        // Cắt LocalDateTime của DB thành Date và Time cho Frontend dễ đọc
        if (lichHen.getNgayHen() != null) {
            this.ngayHen = lichHen.getNgayHen().toLocalDate();
        }
        if (lichHen.getGioHen() != null) {
            this.gioHen = lichHen.getGioHen().toLocalTime();
        }

        this.loaiLich = lichHen.getLoaiLich();
        this.trangThai = lichHen.getTrangThai();
        this.trieuChung = lichHen.getTrieuChung();

        if (lichHen.getKhachHang() != null) {
            this.tenKhachHang = lichHen.getKhachHang().getHoTen();
            this.sdtKhachHang = lichHen.getKhachHang().getSdt(); // Đã sửa thành getSdt()
        }

        if (lichHen.getNhanSu() != null) {
            this.tenBacSi = lichHen.getNhanSu().getHoTen();
        }
    }
}