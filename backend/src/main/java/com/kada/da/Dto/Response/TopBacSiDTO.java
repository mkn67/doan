package com.kada.da.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopBacSiDTO {
    private String maNs;
    private String tenBacSi;

    private Integer tongSoCaKham;

    private Double diemDanhGiaTrungBinh;
}