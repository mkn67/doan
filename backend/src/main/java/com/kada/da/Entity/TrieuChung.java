package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TRIEU_CHUNG")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrieuChung {
    @Id
    @Column(name = "MA_TC", length = 10)
    private String maTc;

    @Column(name = "TEN_TC", nullable = false, length = 200)
    private String tenTc;

    @Column(name = "MO_TA", length = 500)
    private String moTa;

    @Column(name = "IS_ACTIVE")
    @Builder.Default
    private boolean isActive = true;
}