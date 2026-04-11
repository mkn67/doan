package com.kada.da.Dto.Response;

import com.kada.da.Entity.LichHen;
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
    private String trangThai; // 👉 Đổi thành String để trả về cho Frontend dễ đọc
    private String trieuChung;

    // Static Factory Method để Map từ Entity sang DTO
    public static LichHenResponseDTO fromEntity(LichHen lichHen) {
        if (lichHen == null)
            return null;

        LichHenResponseDTOBuilder builder = LichHenResponseDTO.builder()
                .maLh(lichHen.getMaLh())
                .loaiLich(lichHen.getLoaiLich())
                .trieuChung(lichHen.getTrieuChung())
                // .name() để lấy chuỗi (VD: "CHO_XAC_NHAN") thay vì ném thẳng Enum
                .trangThai(lichHen.getTrangThai() != null ? lichHen.getTrangThai().name() : null);

        if (lichHen.getNgayHen() != null) {
            builder.ngayHen(lichHen.getNgayHen().toLocalDate());
        }

        if (lichHen.getGioHen() != null) {
            builder.gioHen(lichHen.getGioHen().toLocalTime());
        }

        if (lichHen.getKhachHang() != null) {
            builder.tenKhachHang(lichHen.getKhachHang().getHoTen());
            builder.sdtKhachHang(lichHen.getKhachHang().getSdt());
        }

        if (lichHen.getNhanSu() != null) {
            builder.tenBacSi(lichHen.getNhanSu().getHoTen());
        }

        return builder.build();
    }
}