package com.kada.da.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "LICH_HEN_TRIEU_CHUNG")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichHenTrieuChung {

    @EmbeddedId
    @Builder.Default
    private LichHenTrieuChungId id = new LichHenTrieuChungId();

    @ManyToOne
    @MapsId("maLh")
    @JoinColumn(name = "MALH")
    @JsonIgnore // Tránh lặp vô tận JSON
    private LichHen lichHen;

    @ManyToOne
    @MapsId("maTc")
    @JoinColumn(name = "MA_TC")
    private TrieuChung trieuChung;

    @Column(name = "MO_TA_TU_DO", length = 500)
    private String moTaTuDo;
}