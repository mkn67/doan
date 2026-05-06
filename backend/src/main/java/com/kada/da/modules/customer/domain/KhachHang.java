package com.kada.da.Entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "KHACH_HANG")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhachHang {
    @Id
    @Column(name = "MAKH", length = 10)
    private String maKh;
    @OneToOne
    @JoinColumn(name = "MATK", unique = true)
    private TaiKhoan taiKhoan;
    @Column(name = "CCCD", length = 12)
    private String cccd;
    @Column(name = "HOTEN", length = 100)
    private String hoTen;
    @Column(name = "NGAYSINH")
    private LocalDate ngaySinh;
    @Column(name = "GIOITINH", length = 10)
    private String gioiTinh;
    @Column(name = "SDT", length = 15, unique = true)
    private String sdt;
    @Column(name = "DIACHI", length = 255)
    private String diaChi;
    @Column(name = "DIEMTICHLUY")
    private Integer diemTichLuy;
    @Column(name = "IS_DELETED")
    private Integer isDeleted;
}