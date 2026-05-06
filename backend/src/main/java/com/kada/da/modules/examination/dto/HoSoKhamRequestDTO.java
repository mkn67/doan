package com.kada.da.Dto;

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
}