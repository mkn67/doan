package com.kada.da.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.CascadeType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "PHIEU_KE_DON")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhieuKeDon {
    @Id
    @Column(name = "MADON", length = 10)
    private String maDon;

    @Column(name = "NGAYKE")
    private LocalDateTime ngayKe;

    @Column(name = "LOIDAN", length = 255)
    private String loiDan;

    @ManyToOne
    @JoinColumn(name = "MAHOSO")
    private HoSoThiLuc hoSoThiLuc;

    @ManyToOne
    @JoinColumn(name = "MAKH")
    private KhachHang khachHang;

    @ManyToOne
    @JoinColumn(name = "MANS")
    private NhanSu nhanSu;

    @OneToMany(mappedBy = "phieuKeDon", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CtKeDon> chiTietDonThuocs;
}