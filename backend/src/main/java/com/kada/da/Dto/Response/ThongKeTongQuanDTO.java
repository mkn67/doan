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
public class ThongKeTongQuanDTO {
    private Integer tongSoBenhNhan;
    private Integer tongSoHoaDon;
    private Integer tongSoDonThuoc;
    private BigDecimal tongDoanhThu;

    // (Tùy chọn ăn điểm) Phần trăm tăng/giảm so với tháng trước
    private Double tyLeTangTruongDoanhThu;
}