package com.kada.da.modules.examination.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditHosoThilucResponseDTO {
    private String maAudit;
    private String maHoSo;
    private String tenKhachHang;
    private String nguoiThayDoi;
    private LocalDateTime thoiGianThayDoi;
    private String ketLuanCu;
    private String ketLuanMoi;
}
