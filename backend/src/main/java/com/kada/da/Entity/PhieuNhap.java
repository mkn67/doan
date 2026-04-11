package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "PHIEU_NHAP")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhieuNhap {
    @Id
    @Column(name = "MAPN", length = 10)
    private String maPn;

    @Column(name = "NGAYNHAP")
    private LocalDateTime ngayNhap;

    @Column(name = "TONGTIEN", precision = 15, scale = 2)
    private BigDecimal tongTien;

    // Liên kết tới Nhà cung cấp
    @ManyToOne
    @JoinColumn(name = "MANCC")
    private NhaCungCap nhaCungCap;

    // Liên kết tới Nhân sự (Người thực hiện nhập kho)
    @ManyToOne
    @JoinColumn(name = "MANS")
    private NhanSu nhanSu;
    // 👇 THÊM CÁC DÒNG NÀY VÀO 👇
    @OneToMany(mappedBy = "phieuNhap", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private List<LoHang> danhSachLoHang;
}