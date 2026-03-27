package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "NHOM")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Nhom {

    @Id
    @EqualsAndHashCode.Include
    @Column(name = "MANHOM", length = 10)
    private String maNhom;

    @Column(name = "TENNHOM", length = 100)
    private String tenNhom;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "NHOM_VAITRO", 
        joinColumns = @JoinColumn(name = "MANHOM"),
        inverseJoinColumns = @JoinColumn(name = "MAVAITRO")
    )
    private Set<VaiTro> vaiTros;
}