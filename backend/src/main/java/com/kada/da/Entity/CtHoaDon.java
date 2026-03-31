package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "CT_HOA_DON")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CtHoaDon {

    @EmbeddedId
    private CtHoaDonId id; // Nhúng cái file Id ông vừa tạo vào đây

    @Column(name = "SOLUONG")
    private Integer soLuong;

    @Column(name = "DONGIA", precision = 15, scale = 2)
    private BigDecimal donGia;

    // Liên kết ngược lại với Hóa đơn
    @ManyToOne
    @MapsId("maHd") // Phải khớp với tên biến trong file CtHoaDonId
    @JoinColumn(name = "MAHD")
    private HoaDon hoaDon;

    // Liên kết với Lô hàng (Ông cần tạo Entity LoHang nữa nhé)
    @ManyToOne
    @MapsId("maLo") 
    @JoinColumn(name = "MALO")
    private LoHang loHang;
}