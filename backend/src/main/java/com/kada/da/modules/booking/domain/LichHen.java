package com.kada.da.modules.booking.domain;

import java.time.LocalDateTime;
import java.util.List;

import com.kada.da.modules.booking.Enum.TrangThaiLichHen;
import com.kada.da.modules.booking.Enum.TrangThaiLichHenConverter;
import com.kada.da.modules.customer.domain.KhachHang;
import com.kada.da.modules.examination.domain.GoiKham;
import com.kada.da.modules.staff.domain.NhanSu;

import jakarta.persistence.CascadeType; // Import Enum
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @Column(name = "TRANGTHAI", length = 50)
    @Convert(converter = TrangThaiLichHenConverter.class)
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