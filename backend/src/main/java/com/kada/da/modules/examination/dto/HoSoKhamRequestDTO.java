package com.kada.da.modules.examination.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class HoSoKhamRequestDTO {
    private String makh;
    private String mans;
    private String ketluan;
    // Mắt trái
    private BigDecimal matTraiSph;
    private BigDecimal matTraiCyl;
    private Integer matTraiAx;
    private BigDecimal doCongTrai;
    // Mắt phải
    private BigDecimal matPhaiSph;
    private BigDecimal matPhaiCyl;
    private Integer matPhaiAx;
    private BigDecimal doCongPhai;
    // Khoảng cách đồng tử
    private BigDecimal pd;
    // Hồ sơ (nếu cập nhật)
    private String maHoSo;
    // Đơn kính gia công (tự động liên kết xưởng)
    private String donKinh;
}