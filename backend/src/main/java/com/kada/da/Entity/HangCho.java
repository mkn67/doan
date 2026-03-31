package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "HANG_CHO")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class HangCho {
    @Id
    @Column(name = "MAHC", length = 10)
    private String maHc;

    @Column(name = "SO_THU_TU")
    private Integer soThuTu;

    @Column(name = "TRANG_THAI", length = 30)
    private String trangThai; // Đang chờ | Đang khám | Hoàn thành

    @Column(name = "GIO_DANG_KY")
    private LocalDateTime gioDangKy;

    @ManyToOne
    @JoinColumn(name = "MAKH")
    private KhachHang khachHang;

    @ManyToOne
    @JoinColumn(name = "MALH")
    private LichHen lichHen;

    @ManyToOne
    @JoinColumn(name = "MANS_PHAN_CONG")
    private NhanSu nhanSuPhanCong;
}