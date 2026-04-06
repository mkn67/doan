package com.kada.da.Entity;

import java.math.BigDecimal;
import jakarta.persistence.*;
import lombok.*;
import com.kada.da.Enum.TrangThaiSanPham; // Import Enum

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
    private Integer laThuoc;

    @Column(name = "GIABAN", precision = 15, scale = 2)
    private BigDecimal giaBan;

    @Column(name = "TON_KHO_TOI_THIEU")
    private Integer tonKhoToiThieu;

    @Column(name = "DON_VI_TINH_KHO", length = 20)
    private String donViTinhKho;

    @Enumerated(EnumType.STRING)
    @Column(name = "TRANG_THAI", length = 30)
    private TrangThaiSanPham trangThai; // THÊM MỚI VÀO ĐÂY

    @ManyToOne
    @JoinColumn(name = "MALOAI")
    private LoaiSanPham loaiSanPham;
}