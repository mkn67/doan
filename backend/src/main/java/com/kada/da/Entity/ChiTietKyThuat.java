package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CHI_TIET_KY_THUAT")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietKyThuat {
    @Id
    @Column(name = "MANS", length = 10)
    private String maNs; // Khóa chính, đồng thời là khóa ngoại tới NHAN_SU

    @Column(name = "CHUYEN_NGANH", length = 100)
    private String chuyenNganh;

    @Column(name = "CHUNG_CHI_HANH_NGHE", length = 100)
    private String chungChiHanhNghe;

    @Column(name = "NAM_CAP_CHUNG_CHI")
    private Integer namCapChungChi;

    @Column(name = "NOI_CAP", length = 200)
    private String noiCap;

    @Column(name = "KINH_NGHIEM_NAM")
    private Integer kinhNghiemNam;

    @Column(name = "GHI_CHU", length = 500)
    private String ghiChu;

    @OneToOne
    @MapsId
    @JoinColumn(name = "MANS")
    private NhanSu nhanSu;
}