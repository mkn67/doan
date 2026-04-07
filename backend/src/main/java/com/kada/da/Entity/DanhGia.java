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
    @JoinColumn(name = "MAHOSO")
    private HoSoThiLuc hoSoThiLuc; // Map với cột MAHOSO

    @ManyToOne
    @JoinColumn(name = "MAKH")
    private KhachHang khachHang; // Map với cột MAKH

    @ManyToOne
    @JoinColumn(name = "MANS")
    private NhanSu nhanSu; // Map với cột MANS

    @Column(name = "SO_SAO")
    private Integer soSao;

    @Column(name = "NOI_DUNG", length = 1000)
    private String noiDung;

    @Column(name = "PHAN_HOI_CHI_TIET", columnDefinition = "JSON")
    private String phanHoiChiTiet;

    @Column(name = "NGAY_DG")
    private LocalDateTime ngayDg;

    @Column(name = "IS_HIDDEN")
    private boolean isHidden;
    // Bổ sung 2 trường này nếu đang thiếu
    @Column(name = "MA_HO_SO")
    private String maHoSo;
}