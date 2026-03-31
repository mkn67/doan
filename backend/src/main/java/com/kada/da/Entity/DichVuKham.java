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
@Table(name = "DICH_VU_KHAM")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DichVuKham {
    @Id
    @Column(name = "MADV", length = 10)
    private String maDv;

    @Column(name = "TENDV", length = 100)
    private String tenDv;

    @Column(name = "GIA", precision = 15, scale = 2)
    private BigDecimal gia;

    @Column(name = "MOTA", length = 255)
    private String moTa;

    @Column(name = "IS_ACTIVE")
    private Integer isActive; // 1: Đang kinh doanh, 0: Ngừng
}