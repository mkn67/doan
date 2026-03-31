package com.kada.da.Entity;

import java.math.BigDecimal;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "SAN_PHAM")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SanPham {
    @Id
    @Column(name = "MASP", length = 10)
    private String maSp;
    
    @Column(name = "TENSP", length = 100)
    private String tenSp;

    @Column(name = "DONVITINH", length = 20)
    private String donViTinh;

    @Column(name = "LATHUOC")
    private Integer laThuoc; // 1: Thuốc, 0: Kính

    @Column(name = "GIABAN", precision = 15, scale = 2)
    private BigDecimal giaBan;

    @Column(name = "TON_KHO_TOI_THIEU")
    private Integer tonKhoToiThieu;

    @Column(name = "DON_VI_TINH_KHO", length = 20)
    private String donViTinhKho;
    
    @ManyToOne
    @JoinColumn(name = "MALOAI")
    private LoaiSanPham loaiSanPham;
}
