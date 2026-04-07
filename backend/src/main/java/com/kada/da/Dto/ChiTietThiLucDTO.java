package com.kada.da.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietThiLucDTO {
    private String loaiMat; // "MP" (Mắt phải - OD) hoặc "MT" (Mắt trái - OS)
    private Double sph; // Độ Cầu (Cận/Viễn) - Ví dụ: -2.00
    private Double cyl; // Độ Trụ (Loạn thị) - Ví dụ: -0.75
    private Integer axis; // Trục loạn thị (Từ 0 đến 180 độ)
    private String va; // Thị lực (Visual Acuity) - Ví dụ: "10/10" hoặc "20/20"
    private Double add; // Độ cộng thêm (Kính lão đọc sách)
    private Double pd; // Khoảng cách đồng tử (Cực kỳ quan trọng để cắt tròng kính)
}