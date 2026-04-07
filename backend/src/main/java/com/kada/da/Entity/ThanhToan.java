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
    @Column(name = "MATT", length = 15)
    private String maTt; // Mã thanh toán/Mã giao dịch (VD: TT260407...)

    @Column(name = "NGAY_THANH_TOAN")
    private LocalDateTime ngayThanhToan;

    @Column(name = "SO_TIEN", precision = 15, scale = 2)
    private BigDecimal soTien;

    @Column(name = "HINH_THUC", length = 50)
    private String hinhThuc; // TIEN_MAT, CHUYEN_KHOAN, QUET_THE

    @Column(name = "GHI_CHU", length = 255)
    private String ghiChu;

    // Quan hệ N-1 với HoaDon (Nhiều lần thanh toán cho 1 hóa đơn)
    @ManyToOne
    @JoinColumn(name = "MAHD")
    private HoaDon hoaDon;

    // Nếu muốn kỹ hơn, có thể liên kết xem Nhân viên nào thu cục tiền này
    @ManyToOne(optional = true)
    @JoinColumn(name = "MANS_THU_NGAN")
    private NhanSu nhanSuThuNgan;
}