package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.kada.da.Enum.TrangThaiHangCho; // Import Enum

@Entity
@Table(name = "HANG_CHO")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HangCho {
    @Id
    @Column(name = "MAHC", length = 10)
    private String maHc;

    @ManyToOne
    @JoinColumn(name = "MAKH")
    private KhachHang khachHang;

    @Column(name = "TEN_KHACH", length = 100)
    private String tenKhach;

    @Column(name = "SO_THU_TU", nullable = false)
    private Integer soThuTu;

    @Column(name = "LOAI_KHACH", length = 20)
    private String loaiKhach;

    @ManyToOne
    @JoinColumn(name = "MALH")
    private LichHen lichHen;

    @ManyToOne
    @JoinColumn(name = "MANS_PHAN_CONG")
    private NhanSu nhanSuPhanCong;

    @Enumerated(EnumType.STRING)
    @Column(name = "TRANG_THAI", length = 30)
    private TrangThaiHangCho trangThai;

    @Column(name = "GIO_DANG_KY")
    private LocalDateTime gioDangKy;

    @Column(name = "GIO_VAO_KHAM")
    private LocalDateTime gioVaoKham;

    @Column(name = "GHI_CHU", length = 255)
    private String ghiChu;
}