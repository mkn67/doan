package com.kada.da.modules.examination.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.kada.da.modules.customer.domain.KhachHang;
import com.kada.da.modules.staff.domain.NhanSu;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

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
    @JsonIgnore
    @OneToMany(
        mappedBy = "hoSoThiLuc",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<ChiTietThiLuc> chiTietThiLucs = new ArrayList<>();
}
