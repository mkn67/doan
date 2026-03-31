package com.kada.da.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "LICH_HEN")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
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
    private String trangThai; 
    @Column(name = "TRIEU_CHUNG", columnDefinition = "JSON")
    private String trieuChung; 

    // Liên kết với Khách hàng
    @ManyToOne
    @JoinColumn(name = "MAKH")
    private KhachHang khachHang;

    // Liên kết với Nhân sự (Bác sĩ được chỉ định khám)
    @ManyToOne
    @JoinColumn(name = "MANS")
    private NhanSu nhanSu;

    // Liên kết với Gói khám (Khách chọn gói nào)
    @ManyToOne
    @JoinColumn(name = "MAGOI")
    private GoiKham goiKham;
}