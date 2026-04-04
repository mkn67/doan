package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "HO_SO_THI_LUC")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoSoThiLuc {
    @Id
    @Column(name = "MAHOSO", length = 10)
    private String maHoSo;

    @ManyToOne
    @JoinColumn(name = "MAKH")
    private KhachHang khachHang;

    @ManyToOne
    @JoinColumn(name = "MANS")
    private NhanSu nhanSu;

    @Column(name = "NGAYKHAM")
    private LocalDate ngayKham;

    @Column(name = "KETLUAN", length = 255)
    private String ketLuan;

    @Builder.Default
    @OneToMany(mappedBy = "hoSoThiLuc", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChiTietThiLuc> chiTietThiLucs = new ArrayList<>();
}
