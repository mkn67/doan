package com.kada.da.Entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "GOI_KHAM")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class GoiKham {
    @Id
    @Column(name = "MAGOI", length = 10)
    private String maGoi;

    @Column(name = "TENGOI", length = 100)
    private String tenGoi;

    @Column(name = "GIA")
    private BigDecimal gia;

    @Column(name = "THOILUONG")
    private Integer thoiLuong; // Số phút khám dự kiến
}