package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "NHOM")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Nhom {
    @Id
    @Column(name = "MA_NHOM", length = 10)
    private String maNhom;

    @Column(name = "TEN_NHOM", length = 100)
    private String tenNhom;

    // THIẾU DÒNG NÀY NÈ ÔNG:
    @Column(name = "MO_TA", length = 500)
    private String moTa;

    @ManyToMany
    @JoinTable(name = "NHOM_VAI_TRO", joinColumns = @JoinColumn(name = "MA_NHOM"), inverseJoinColumns = @JoinColumn(name = "MA_VAI_TRO"))
    private List<VaiTro> vaiTros;
}