package com.kada.da.Dto.Response;

import com.kada.da.Entity.LichHen;
import com.kada.da.Enum.TrangThaiLichHen; // IMPORT ENUM VÀO ĐÂY
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichHenResponseDTO {

    private String maLh;
    private String tenKhachHang;
    private String sdtKhachHang;
    private String tenBacSi;
    private LocalDate ngayHen;
    private LocalTime gioHen;
    private String loaiLich;
    private TrangThaiLichHen trangThai;
    private String trieuChung;

    public LichHenResponseDTO(LichHen lichHen) {
        this.maLh = lichHen.getMaLh();

        if (lichHen.getNgayHen() != null) {
            this.ngayHen = lichHen.getNgayHen().toLocalDate();
        }
        if (lichHen.getGioHen() != null) {
            this.gioHen = lichHen.getGioHen().toLocalTime();
        }

        this.loaiLich = lichHen.getLoaiLich();
        // ĐÃ SỬA: Bây giờ gán trực tiếp Enum cho Enum, không còn lỗi nữa
        this.trangThai = lichHen.getTrangThai();

        this.trieuChung = lichHen.getTrieuChung();

        if (lichHen.getKhachHang() != null) {
            this.tenKhachHang = lichHen.getKhachHang().getHoTen();
            this.sdtKhachHang = lichHen.getKhachHang().getSdt();
        }

        if (lichHen.getNhanSu() != null) {
            this.tenBacSi = lichHen.getNhanSu().getHoTen();
        }
    }
}