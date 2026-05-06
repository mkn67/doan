package com.kada.da.Entity;

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
    @Column(name = "MAT", length = 10)
    private String mat;

    @Column(name = "CAU")
    private Double cau;

    @Column(name = "TRU")
    private Double tru;

    @Column(name = "TRUC")
    private Integer truc;

    @Column(name = "THILUC", length = 20)
    private String thiLuc;
}