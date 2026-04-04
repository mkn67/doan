package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "TAI_KHOAN")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaiKhoan {
    @Id
    @Column(name = "MATK", length = 10)
    private String maTk;

    @Column(name = "TENDANGNHAP", length = 50, unique = true)
    private String tenDangNhap;

    @Column(name = "MATKHAU", length = 255)
    private String matKhau;

    // THÊM MỚI: Phân biệt "KHACH_HANG" hay "NHAN_SU"
    @Column(name = "LOAI_TK", length = 20)
    private String loaiTk;

    @Column(name = "TRANGTHAI")
    private Integer trangThai;
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "TAIKHOAN_NHOM", joinColumns = @JoinColumn(name = "MATK"), inverseJoinColumns = @JoinColumn(name = "MANHOM"))
    private List<Nhom> danhSachNhom;
}