package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "XU_LY_KINH")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class XuLyKinh {

    @Id
    @Column(name = "MAXLK", length = 10)
    private String maXlk;

    @Column(name = "NGAY_NHAN")
    private LocalDateTime ngayNhan;

    @Column(name = "NGAY_HEN_TRA")
    private LocalDateTime ngayHenTra;

    @Column(name = "TINH_TRANG", length = 50)
    private String tinhTrang; // Ví dụ: Đang mài, Chờ lắp, Đã xong, Đã giao

    @Column(name = "GHI_CHU", length = 500)
    private String ghiChu;

    // Liên kết với Hồ sơ thị lực (Để biết thông số độ mà mài kính)
    @ManyToOne
    @JoinColumn(name = "MAHOSO")
    private HoSoThiLuc hoSoThiLuc;

    // Liên kết với Nhân sự (Người chịu trách nhiệm kỹ thuật/mài lắp)
    @ManyToOne
    @JoinColumn(name = "MANS_KY_THUAT")
    private NhanSu nhanSuKyThuat;

    // Liên kết với Hóa đơn (Để biết kính này thuộc đơn hàng nào)
    @ManyToOne
    @JoinColumn(name = "MAHD")
    private HoaDon hoaDon;
}