package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

    @Column(name = "SO_THU_TU")
    private Integer soThuTu;

    @Enumerated(EnumType.STRING)
    @Column(name = "TRANG_THAI", length = 30)
    private TrangThaiHangCho trangThai; // ĐÃ SỬA: Đổi String thành TrangThaiHangCho

    @Column(name = "GIO_DANG_KY")
    private LocalDateTime gioDangKy;

    @ManyToOne
    @JoinColumn(name = "MAKH")
    @JsonIgnore
    private KhachHang khachHang;

    @ManyToOne
    @JoinColumn(name = "MALH")
    @JsonIgnore
    private LichHen lichHen;

    @ManyToOne
    @JoinColumn(name = "MANS_PHAN_CONG")
    @JsonIgnore
    private NhanSu nhanSuPhanCong;
}