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
public class CtHoaDonDvId implements Serializable {
    @Column(name = "MAHD")
    private String maHd;

    @Column(name = "MADV")
    private String maDv;
}