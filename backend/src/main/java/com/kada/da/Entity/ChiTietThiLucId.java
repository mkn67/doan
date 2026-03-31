package com.kada.da.Entity;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Embeddable
@Data @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class ChiTietThiLucId implements Serializable {
    @Column(name = "MAHOSO")
    private String maHoSo;
    @Column(name = "MAT",length = 1)
    private String mat;
}

