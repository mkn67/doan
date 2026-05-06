package com.kada.da.modules.inventory.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CanhBaoTonKhoDto {
    private String maSp;
    private String tenSp;
    private String donViTinh;
    private Long tongTon;
    private Integer tonKhoToiThieu;
    private String mucDo; // "Het hang", "Sap het", "Canh bao"
}
