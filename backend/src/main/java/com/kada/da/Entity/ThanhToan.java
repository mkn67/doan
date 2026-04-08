package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "THANH_TOAN")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThanhToan {
    @Id
    @Column(name = "MATT", length = 10)
    private String maTt;

    @ManyToOne
    @JoinColumn(name = "MAHD")
    private HoaDon hoaDon;

    @ManyToOne
    @JoinColumn(name = "MANS")
    private NhanSu nhanSu;

    @Column(name = "NGAYTHANHTOAN")
    private LocalDateTime ngayThanhToan;

    @Column(name = "SOTIEN", precision = 15, scale = 2)
    private BigDecimal soTien;

    @Column(name = "PHUONGTHUC", length = 50)
    private String phuongThuc; // Tiền mặt, Chuyển khoản, Thẻ

    @Column(name = "TRANGTHAI", length = 50)
    private String trangThai; // Hoàn thành, Đã hủy, Chờ xử lý
}