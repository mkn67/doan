package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "LO_HANG")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class LoHang {

    @Id
    @Column(name = "MALO", length = 10)
    private String maLo;

    @Column(name = "NGAYSANXUAT")
    private LocalDate ngaySanXuat;

    @Column(name = "NGAYHETHAN")
    private LocalDate ngayHetHan;

    @Column(name = "SOLUONGNHAP")
    private Integer soLuongNhap;

    @Column(name = "SOLUONGTON")
    private Integer soLuongTon;

    @Column(name = "GIANHAP", precision = 15, scale = 2)
    private BigDecimal giaNhap;

    // Liên kết tới Sản phẩm (Biết lô này là của sản phẩm nào)
    @ManyToOne
    @JoinColumn(name = "MASP")
    private SanPham sanPham;

    // Liên kết tới Phiếu nhập (Biết lô này nhập từ đợt nào)
    @ManyToOne
    @JoinColumn(name = "MAPN")
    private PhieuNhap phieuNhap;
}