package com.kada.da.modules.prescription.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietKyThuatResponseDTO {
    private String maCtkt;
    private String tenNhanSu;
    private String chucVu;
    private String tenKyThuat;
    private String trinhDo;
    private String donViCap;
    private LocalDateTime ngayCapNhat;
}