package com.kada.da.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CT_HOA_DON")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CtHoaDon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MACTHD")
    private Integer maCtHd;

    @ManyToOne
    @JoinColumn(name = "MAHD")
    @JsonIgnore
    private HoaDon hoaDon;

    @ManyToOne
    @JoinColumn(name = "MALO")
    private LoHang loHang;

    @Column(name = "SOLUONG")
    private Integer soLuong;

    @Column(name = "DONGIA")
    private Double donGia;
}