package com.kada.da.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThongKeDoanhThuTheoNgayDTO {
    private LocalDate ngay;

    private BigDecimal doanhThuKinhVaThuoc; // Tiền bán hàng (Từ CtHoaDon)
    private BigDecimal doanhThuKhamBenh; // Tiền dịch vụ/công khám (Từ CtHoaDonDv)

    private BigDecimal tongDoanhThu; // = Kính/Thuốc + Khám bệnh

    private Integer tongSoHoaDon; // Hôm nay xuất được bao nhiêu bill
}