package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "GOI_KHAM")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoiKham {
    @Id
    @Column(name = "MAGOI", length = 10)
    private String maGoi;

    @Column(name = "TENGOI", length = 100, nullable = false)
    private String tenGoi;

    @Column(name = "MOTA", length = 500)
    private String moTa; // Thêm

    @Column(name = "GIA", nullable = false)
    private BigDecimal gia;

    @Column(name = "THOILUONG")
    private Integer thoiLuong;

    @Column(name = "IS_ACTIVE")
    private Integer isActive;
}