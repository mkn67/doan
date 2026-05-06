package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
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

    @Column(name = "USERNAME", unique = true, length = 50)
    private String username;

    @Column(name = "PASSWORD", length = 255)
    private String password;

    @Column(name = "LOAI_TK", length = 20)
    private String loaiTk;

    @Column(name = "TRANGTHAI")
    private Integer trangThai;

    // 👉 Quan hệ Many-to-Many với NHOM, thông qua bảng TAIKHOAN_NHOM
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "TAIKHOAN_NHOM", joinColumns = @JoinColumn(name = "MATK"), inverseJoinColumns = @JoinColumn(name = "MANHOM"))
    @Builder.Default
    private List<Nhom> danhSachNhom = new ArrayList<>();
}