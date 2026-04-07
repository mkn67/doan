package com.kada.da.Entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.kada.da.Enum.TrangThaiHoaDon;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.EnumType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "HOA_DON")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoaDon {
    @Id
    @Column(name = "MAHD", length = 10)
    private String maHd;

    @Column(name = "NGAYLAP")
    private LocalDateTime ngayLap;

    @Column(name = "TONGTIEN", precision = 15, scale = 2)
    private BigDecimal tongTien;
    @Enumerated(EnumType.STRING)
    @Column(name = "TRANGTHAI", length = 50)
    private TrangThaiHoaDon trangThai; // PHẢI LÀ TrangThaiHoaDon, KHÔNG ĐƯỢC LÀ String

    @Column(name = "IS_DELETED")
    private Integer isDeleted;

    @ManyToOne
    @JoinColumn(name = "MAKH")
    private KhachHang khachHang;

    @ManyToOne
    @JoinColumn(name = "MANS")
    private NhanSu nhanSu;

    @ManyToOne(optional = true)
    @JoinColumn(name = "MAHOSO", nullable = true)
    private HoSoThiLuc hoSoThiLuc;

    @ManyToOne(optional = true)
    @JoinColumn(name = "MADON", nullable = true)
    private PhieuKeDon phieuKeDon;

    @OneToMany(mappedBy = "hoaDon", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CtHoaDon> ctHoaDons;
    @OneToMany(mappedBy = "hoaDon", cascade = CascadeType.ALL)
    private List<ThanhToan> danhSachThanhToan;
}