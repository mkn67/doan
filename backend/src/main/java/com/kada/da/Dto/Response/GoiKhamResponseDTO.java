package com.kada.da.Dto.Response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoiKhamResponseDTO {
    private String maGoi;
    private String tenGoi;
    private BigDecimal giaGoi;
    private String moTa;

    private List<DichVuKhamResponseDTO> chiTietDichVu;
}