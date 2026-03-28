package com.kada.da.Entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "HOA_DON")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class HoaDon {
    @Id
    @Column(name = "MAHD", length = 10)
    private String maHd;

    @Column(name = "NGAYLAP")
    private LocalDateTime ngayLap;

    @Column(name = "TONGTIEN", precision = 15, scale = 2)
    private BigDecimal tongTien;

    @Column(name = "TRANGTHAI", length = 50)
    private String trangThai;

    @Column(name = "IS_DELETED")
    private Integer isDeleted;

    @ManyToOne
    @JoinColumn(name = "MAKH")
    private KhachHang khachHang;

    @ManyToOne
    @JoinColumn(name = "MANS")
    private NhanSu nhanSu;

    @ManyToOne
    @JoinColumn(name = "MAHOSO")
    private HoSoThiLuc hoSoThiLuc;
}