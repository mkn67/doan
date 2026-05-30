package com.kada.da.modules.staff.domain;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.kada.da.modules.auth.domain.TaiKhoan;
import com.kada.da.modules.auth.domain.VaiTro;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @JsonIgnore
    @ManyToMany
    @JoinTable(name = "NHOM_VAI_TRO", joinColumns = @JoinColumn(name = "MANHOM"), inverseJoinColumns = @JoinColumn(name = "MAVAITRO"))
    private List<VaiTro> vaiTros;

    @ManyToMany(mappedBy = "danhSachNhom")
    @JsonIgnore
    private List<TaiKhoan> danhSachTaiKhoan;
}
