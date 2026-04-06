package com.kada.da.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CT_KE_DON")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CtKeDon {

    @EmbeddedId
    private CtKeDonId id; // Nhúng khóa phức tạp (MADON, MASP)

    @Column(name = "SOLUONG")
    private Integer soLuong;

    @Column(name = "LIEUDUNG", length = 100)
    private String lieuDung;

    @Column(name = "CACHDUNG", length = 100)
    private String cachDung;

    // Liên kết ngược về Phiếu kê đơn
    @ManyToOne
    @MapsId("maDon") // Khớp với tên biến trong CtKeDonId
    @JoinColumn(name = "MADON")
    @JsonIgnore
    private PhieuKeDon phieuKeDon;

    // Liên kết tới Sản phẩm (Thuốc hoặc Kính)
    @ManyToOne
    @MapsId("maSp") // Khớp với tên biến trong CtKeDonId
    @JoinColumn(name = "MASP")
    private SanPham sanPham;
}