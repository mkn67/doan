package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "VAITRO")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VaiTro {
    @Id
    @Column(name = "MAVAITRO", length = 10)
    private String maVaiTro;

    @Column(name = "TENVAITRO", length = 100)
    private String tenVaiTro;
    @Column(name = "MO_TA", length = 500)
    private String moTa;
}