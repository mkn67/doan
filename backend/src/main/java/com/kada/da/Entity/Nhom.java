package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "NHOM")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Nhom {
    @Id
    @Column(name = "MANHOM", length = 10)
    private String maNhom;

    @Column(name = "TENNHOM", length = 100)
    private String tenNhom;

    @Column(name = "MOTA", length = 500)
    private String moTa;

    @ManyToMany
    @JoinTable(name = "NHOM_VAI_TRO", joinColumns = @JoinColumn(name = "MANHOM"), inverseJoinColumns = @JoinColumn(name = "MAVAITRO"))
    private List<VaiTro> vaiTros;

    // Quan hệ ngược với TaiKhoan (để JPA quản lý 2 chiều)
    @ManyToMany(mappedBy = "danhSachNhom")
    @JsonIgnore
    private List<TaiKhoan> danhSachTaiKhoan;
}