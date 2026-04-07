package com.kada.da.Dto.Response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoaDonResponseDTO {
    private String maHd;
    private LocalDateTime ngayLap;
    private BigDecimal tongTien;
    private String trangThai;
    private String tenKhachHang;
    private String sdtKhachHang; // Thêm cái này để lúc in hóa đơn có thông tin liên lạc
    private String tenNhanVienLap;

    // Tách làm 2 danh sách để Frontend hiển thị chuyên nghiệp hơn
    private List<ChiTietSanPhamResponse> danhSachSanPham;
    private List<ChiTietDichVuResponse> danhSachDichVu;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChiTietSanPhamResponse {
        private String tenSanPham;
        private String maLo; // Hiển thị mã lô để khách biết hàng đợt nào
        private Integer soLuong;
        private BigDecimal donGia;
        private BigDecimal thanhTien;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChiTietDichVuResponse {
        private String tenDichVu;
        private Integer soLuong;
        private BigDecimal donGia;
        private BigDecimal thanhTien;
        private String ghiChu;
    }
}