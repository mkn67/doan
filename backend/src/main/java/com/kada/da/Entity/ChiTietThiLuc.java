package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "CHI_TIET_THI_LUC")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ChiTietThiLuc {
    @EmbeddedId
    private ChiTietThiLucId id;
    @ManyToOne
    @MapsId("maHoSo") // Liên kết id.maHoSo với khóa ngoại MAHOSO
    @JoinColumn(name = "MAHOSO")
    private HoSoThiLuc hoSoThiLuc;
    @Column(name = "DOCAU_SPH", precision = 4, scale = 2)
    private BigDecimal doCauSph;
    @Column(name = "DOTRU_CYL", precision = 4, scale = 2)
    private BigDecimal doTruCyl;
    @Column(name = "TRUC_AX")
    private Integer trucAx;
    @Column(name = "KHOANGCACH_PD", precision = 3, scale = 1)
    private BigDecimal khoangCachPd;
    @Column(name = "DOCONG_ADD", precision = 4, scale = 2)
    private BigDecimal doCongAdd;
}