package com.kada.da.modules.inventory.domain;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

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

    @ManyToOne
    @JoinColumn(name = "MALOAI")
    private LoaiSanPham loaiSanPham;

    @Column(name = "TENSP", length = 100)
    private String tenSp;

    @Column(name = "DONVITINH", length = 20)
    private String donViTinh;

    @Column(name = "LATHUOC")
    private Integer laThuoc; // 0/1

    @Column(name = "GIABAN", precision = 15, scale = 2)
    private BigDecimal giaBan;

    @Column(name = "TON_KHO_TOI_THIEU")
    private Integer tonKhoToiThieu;

    @Column(name = "DON_VI_TINH_KHO", length = 20)
    private String donViTinhKho;

    @JsonIgnore
    @OneToMany(mappedBy = "sanPham", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private List<LoHang> danhSachLoHang = new ArrayList<>();
}
