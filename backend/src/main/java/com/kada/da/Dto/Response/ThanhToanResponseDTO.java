package com.kada.da.Dto.Response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThanhToanResponseDTO {
    private String maGiaoDich;
    private String maHd;
    private String tenNhanVienThuNgan;
    private LocalDateTime ngayThanhToan;
    private BigDecimal soTien;
    private BigDecimal tienConNo;

    private String hinhThucThanhToan;
    private String thongBao;
}