package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "XU_LY_KINH")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class XuLyKinh {
    @Id
    @Column(name = "MAXL", length = 10)
    private String maXl;

    @ManyToOne
    @JoinColumn(name = "MADON", nullable = false)
    private PhieuKeDon phieuKeDon;

    @Column(name = "THONG_SO_KINH", columnDefinition = "JSON")
    private String thongSoKinh;

    @Column(name = "TRANG_THAI", length = 30)
    private String trangThai;

    @Column(name = "NGAY_BAT_DAU")
    private LocalDateTime ngayBatDau;

    @Column(name = "NGAY_HOAN_THANH")
    private LocalDateTime ngayHoanThanh;

    @ManyToOne
    @JoinColumn(name = "MANS_KY_THUAT")
    private NhanSu nhanSuKyThuat;

    @Column(name = "GHI_CHU", length = 255)
    private String ghiChu;
}