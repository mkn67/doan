package com.kada.da.modules.examination.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CHI_TIET_THI_LUC")
@IdClass(ChiTietThiLucId.class) // Khai báo class khóa chính kép ở đây
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietThiLuc {

    @Id
    @ManyToOne
    @JoinColumn(name = "MAHOSO")
    @JsonIgnore
    private HoSoThiLuc hoSoThiLuc;
    @Id
    @Column(name = "MAT", length = 1)
    private String mat;

    @Column(name = "DOCAU_SPH")
    private Double cau;

    @Column(name = "DOTRU_CYL")
    private Double tru;

    @Column(name = "TRUC_AX")
    private Integer truc;

    @Column(name = "KHOANGCACH_PD")
    private Double pd;

    @Column(name = "DOCONG_ADD")
    private Double add;

    @Transient
    private String thiLuc;
}