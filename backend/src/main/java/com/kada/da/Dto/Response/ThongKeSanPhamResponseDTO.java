package com.kada.da.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThongKeSanPhamResponseDTO {
    private String maSp;
    private String tenSanPham;
    private String loaiSanPham; // Để filter: Bán chạy nhất nhóm Kính, Bán chạy nhất nhóm Thuốc

    private Integer tongSoLuongBan; // Số lượng xuất kho thành công

    private BigDecimal tongDoanhThuMangLai; // Tiền thu được từ sản phẩm này

}