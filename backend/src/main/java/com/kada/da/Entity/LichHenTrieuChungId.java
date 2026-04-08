package com.kada.da.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LichHenTrieuChungId implements Serializable {
    @Column(name = "MALH")
    private String maLh;

    @Column(name = "MA_TC")
    private String maTc;
}