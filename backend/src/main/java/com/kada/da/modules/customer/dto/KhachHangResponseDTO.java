package com.kada.da.modules.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhachHangResponseDTO {
    private String maKh;
    private String hoTen;
    private String sdt;
    private String email;
    private String diaChi;
    private String ghiChu;

    private String cccd;
    private java.time.LocalDate ngaySinh;
    private String gioiTinh;
    private Integer diemTichLuy;

    // Thêm các thông tin thống kê để "ăn điểm" IS201
    private LocalDateTime ngayTao;
    private Integer tongSoLanKham; // Tính từ số lượng HoSoThiLuc
    private Double tongChiTieu; // Tổng tiền từ các HoaDon
    private String lichHenGanNhat; // Ngày giờ lịch hẹn sắp tới
}