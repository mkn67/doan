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
public class SanPhamResponseDTO {
    private String maSp;
    private String tenSp;
    private String tenLoai; // Map từ LoaiSanPham.tenLoai
    private String tenNhaCungCap; // Map từ NhaCungCap.tenNcc
    private BigDecimal giaBan;
    private Integer tongTonKho; // Tổng số lượng từ tất cả các lô (LoHang)
    private String trangThai; // Lấy từ Enum TrangThaiSanPham.getValue()
    private Boolean laThuoc; // Để Frontend hiển thị icon khác nhau
}