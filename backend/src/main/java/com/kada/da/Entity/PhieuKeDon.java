package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
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

    @ManyToOne
    @JoinColumn(name = "MAHOSO")
    private HoSoThiLuc hoSoThiLuc;

    @ManyToOne
    @JoinColumn(name = "MANS")
    private NhanSu nhanSu;

    @Column(name = "NGAYKEDON")
    private LocalDateTime ngayKeDon; // Chú ý: SQL dùng NGAYKEDON (DATE)

    @Column(name = "LOIDAN", length = 255)
    private String loiDan;

    @OneToMany(mappedBy = "phieuKeDon", cascade = CascadeType.ALL)
    private List<CtKeDon> chiTietKeDons;
}