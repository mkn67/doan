package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "DANH_GIA")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DanhGia {
    @Id
    @Column(name = "MADG", length = 10)
    private String maDg;

    @ManyToOne
    @JoinColumn(name = "MAHOSO", nullable = false)
    private HoSoThiLuc hoSoThiLuc;

    @ManyToOne
    @JoinColumn(name = "MAKH", nullable = false)
    private KhachHang khachHang;

    @ManyToOne
    @JoinColumn(name = "MANS", nullable = false)
    private NhanSu nhanSu;

    @Column(name = "SO_SAO", nullable = false)
    private Integer soSao;

    @Column(name = "NOI_DUNG", length = 500)
    private String noiDung;

    @Column(name = "PHAN_HOI_CHI_TIET", columnDefinition = "JSON")
    private String phanHoiChiTiet;

    @Column(name = "NGAY_DG")
    private LocalDateTime ngayDg;

    @Column(name = "IS_HIDDEN")
    private Integer isHidden;
}