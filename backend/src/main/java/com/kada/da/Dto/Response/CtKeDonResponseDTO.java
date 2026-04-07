package com.kada.da.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CtKeDonResponseDTO {
    private String maSp; // Mã thuốc/kính
    private String tenSanPham; // Tên thuốc/kính để in lên phiếu
    private String loaiSanPham; // Dùng để UI phân nhóm: Đơn thuốc riêng, Đơn kính riêng

    private Integer soLuong;

    private String lieuDung; // "Ngày 2 lần"
    private String cachDung; // "Uống sau ăn"
    private String ghiChu;
}