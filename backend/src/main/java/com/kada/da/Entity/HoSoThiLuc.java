package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "HO_SO_THI_LUC")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class HoSoThiLuc {
    @Id
    @Column(name = "MAHOSO", length = 10)
    private String maHoSo;
    @ManyToOne
    @JoinColumn(name = "MAKH")
    private KhachHang khachHang;
    @ManyToOne
    @JoinColumn(name = "MANS")
    private NhanSu bacSi;
    @Column(name = "NGAYKHAM")
    private LocalDateTime ngayKham;
    @Column(name = "KETLUAN", length = 255)
    private String ketLuan;
}
