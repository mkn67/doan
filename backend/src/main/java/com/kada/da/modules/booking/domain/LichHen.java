package com.kada.da.Entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;
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

    @ManyToOne
    @JoinColumn(name = "MAKH")
    private KhachHang khachHang;

    @ManyToOne
    @JoinColumn(name = "MANS")
    private NhanSu nhanSu;

    @ManyToOne
    @JoinColumn(name = "MAGOI")
    private GoiKham goiKham;

    public String getTrieuChung() {
        if (danhSachTrieuChung == null || danhSachTrieuChung.isEmpty()) {
            return "";
        }
        return danhSachTrieuChung.stream()
                .map(lhtc -> lhtc.getTrieuChung() != null ? lhtc.getTrieuChung().getTenTc() : lhtc.getMoTaTuDo())
                .collect(java.util.stream.Collectors.joining(", "));
    }

    @OneToMany(mappedBy = "lichHen", cascade = CascadeType.ALL)
    private List<LichHenTrieuChung> danhSachTrieuChung; // Sửa lại kiểu dữ liệu cho đúng bảng trung gian
}