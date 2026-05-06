package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CT_HOA_DON")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CtHoaDon {

    @EmbeddedId
    private CtHoaDonId id; // Đây chính là khóa chính tổng hợp của ông

    @Column(name = "SOLUONG")
    private Integer soLuong;

    @Column(name = "DONGIA", precision = 15, scale = 2)
    private java.math.BigDecimal donGia;

    // Nếu ông muốn liên kết ngược lại Entity HoaDon để lấy thông tin
    @ManyToOne
    @MapsId("maHd") // Nó sẽ map cột maHd trong CtHoaDonId với bảng HOA_DON
    @JoinColumn(name = "MAHD", insertable = false, updatable = false)
    private HoaDon hoaDon;

    @ManyToOne
    @MapsId("maLo") // Nó sẽ map cột maLo trong CtHoaDonId với bảng LO_HANG
    @JoinColumn(name = "MALO", insertable = false, updatable = false)
    private LoHang loHang;
}