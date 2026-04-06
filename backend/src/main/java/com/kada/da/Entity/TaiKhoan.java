package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import com.kada.da.Enum.LoaiTaiKhoan;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "LOAI_TK", length = 20)
    private LoaiTaiKhoan loaiTk; // Sử dụng đúng Enum LoaiTaiKhoan

    @Column(name = "TRANGTHAI")
    private Integer trangThai;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "TAIKHOAN_NHOM", joinColumns = @JoinColumn(name = "MATK"), inverseJoinColumns = @JoinColumn(name = "MANHOM"))
    private List<Nhom> danhSachNhom;
}