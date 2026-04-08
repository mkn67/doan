package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "LICH_LAM_VIEC")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichLamViec {
    @Id
    @Column(name = "MALLV", length = 10)
    private String maLlv;

    @ManyToOne
    @JoinColumn(name = "MANS", nullable = false)
    private NhanSu nhanSu;

    @Column(name = "NGAY_LAM", nullable = false)
    private LocalDate ngayLam;

    @Column(name = "GIO_BAT_DAU", nullable = false)
    private Double gioBatDau; // Số giờ (ví dụ 7.5 = 7:30)

    @Column(name = "GIO_KET_THUC", nullable = false)
    private Double gioKetThuc;

    @Column(name = "IS_NGHI")
    private Integer isNghi; // 0: làm, 1: nghỉ
}