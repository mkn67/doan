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
public class CtKeDonId implements Serializable {
    @Column(name = "MADON")
    private String maDon;
    @Column(name = "MASP")
    private String maSp;
}

