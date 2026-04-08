package com.kada.da.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.kada.da.Enum.LoaiTaiKhoan;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoHangResponseDTO {
    private String maLo;
    private String tenSanPham;
    private Integer soLuongNhap;
    private String maSp;
    // Cực kỳ quan trọng: Số lượng còn lại trên kệ
    private Integer soLuongTon;

    private BigDecimal giaNhap;
    private LocalDate ngaySanXuat;
    private LocalDate ngayHetHan;

    // Controller/Service sẽ tính toán: "Còn hạn", "Sắp hết hạn", "Đã hết hạn"
    private String trangThaiHsd;
    private LoaiTaiKhoan loaiTk;
}