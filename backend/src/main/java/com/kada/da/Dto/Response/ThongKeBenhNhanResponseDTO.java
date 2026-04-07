package com.kada.da.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThongKeBenhNhanResponseDTO {
    private String thoiGian; // Có thể là chuỗi "04/2026" (theo tháng) hoặc "2026" (theo năm)

    private Integer tongSoBenhNhan;

    // Bóc tách chi tiết để vẽ biểu đồ Stacked Bar (Cột chồng)
    private Integer benhNhanMoi; // Lần đầu đến khám
    private Integer benhNhanTaiKham; // Khách quen
}