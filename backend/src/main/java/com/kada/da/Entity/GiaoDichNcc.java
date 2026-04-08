package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "GIAO_DICH_NCC")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiaoDichNcc {
    @Id
    @Column(name = "MAGD", length = 10)
    private String maGd;

    // ThanhToan | TraHang | KhacKhau
    @Column(name = "LOAI", length = 20)
    private String loai;

    @Column(name = "SO_TIEN", precision = 15, scale = 2)
    private BigDecimal soTien;

    @Column(name = "NGAY_GD")
    private LocalDateTime ngayGd;

    @Column(name = "GHI_CHU", length = 255)
    private String ghiChu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MANCC")
    private NhaCungCap nhaCungCap;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MAPN")
    private PhieuNhap phieuNhap;
}
