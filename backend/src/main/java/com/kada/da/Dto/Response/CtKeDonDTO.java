package com.kada.da.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CtKeDonDTO {
    private String maSp;
    private String tenSanPham;
    private String loaiSanPham; // Để phân biệt Thuốc hay Kính
    private Integer soLuong;
    private String lieuDung; // Ví dụ: "Sáng 1 viên, tối 1 viên"
    private String cachDung; // Ví dụ: "Uống sau khi ăn no"
    private String ghiChu;
}