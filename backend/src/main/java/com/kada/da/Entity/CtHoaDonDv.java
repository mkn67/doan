package com.kada.da.Entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "CT_HOA_DON_DV")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CtHoaDonDv {
    @EmbeddedId
    private CtHoaDonDvId id;

    @Column(name = "SOLUONG")
    private Integer soLuong;

    @Column(name = "DONGIA")
    private BigDecimal donGia;

    @ManyToOne
    @MapsId("maHd")
    @JoinColumn(name = "MAHD")
    private HoaDon hoaDon;

    @ManyToOne
    @MapsId("maDv")
    @JoinColumn(name = "MADV")
    private DichVuKham dichVuKham;
}