package com.kada.da.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhieuKeDonResponseDTO {
    private String maDon;
    private String tenBacSi;
    private String tenKhachHang;
    private LocalDateTime ngayKe;
    private String loiKhuyen;
    private String ghiChu;

    private List<CtKeDonResponse> danhSachKeDon;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CtKeDonResponse {
        private String tenSanPham;
        private String loaiSanPham;
        private Integer soLuong;
        private String lieuDung;
        private String cachDung;
    }
}