package com.kada.da.Entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;
import com.kada.da.Enum.TrangThaiLichHen; // Import Enum

@Entity
@Table(name = "LICH_HEN")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichHen {

    @Id
    @Column(name = "MALH", length = 10)
    private String maLh;

    @Column(name = "NGAYHEN")
    private LocalDateTime ngayHen;

    @Column(name = "GIO_HEN")
    private LocalDateTime gioHen;

    @Column(name = "LOAI_LICH", length = 20)
    private String loaiLich;

    @Enumerated(EnumType.STRING)
    @Column(name = "TRANGTHAI", length = 50)
    private TrangThaiLichHen trangThai; // ĐÃ SỬA

    @Column(name = "TRIEU_CHUNG", columnDefinition = "JSON")
    private String trieuChung;

    @ManyToOne
    @JoinColumn(name = "MAKH")
    private KhachHang khachHang;

    @ManyToOne
    @JoinColumn(name = "MANS")
    private NhanSu nhanSu;

    @ManyToOne
    @JoinColumn(name = "MAGOI")
    private GoiKham goiKham;
}