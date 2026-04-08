package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "NHAN_SU")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhanSu {
    @Id
    @Column(name = "MANS", length = 10)
    private String maNs;

    @OneToOne
    @JoinColumn(name = "MATK", unique = true)
    private TaiKhoan taiKhoan;

    @ManyToOne
    @JoinColumn(name = "MACV")
    private ChucVu chucVu;

    @Column(name = "CCCD", length = 12)
    private String cccd;

    @Column(name = "HOTEN", length = 100)
    private String hoTen;

    @Column(name = "NGAYSINH")
    private LocalDate ngaySinh;

    @Column(name = "GIOITINH", length = 10)
    private String gioiTinh;

    @Column(name = "SDT", length = 15)
    private String sdt;

    @Column(name = "DIACHI", length = 255)
    private String diaChi;

    @Column(name = "CHUYENKHOA", length = 100)
    private String chuyenKhoa;

    @Column(name = "IS_DELETED")
    private Integer isDeleted;
}
