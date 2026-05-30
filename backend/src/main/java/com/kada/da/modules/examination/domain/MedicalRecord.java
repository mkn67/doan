package com.kada.da.modules.examination.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecord {
    private String maHoSo;
    private String maKh;
    private String maNs;
    private String ketLuan;
    private LocalDateTime ngayKham;
    
    // Left Eye (OS)
    private BigDecimal matTraiSph;
    private BigDecimal matTraiCyl;
    private Integer matTraiAx;
    private BigDecimal doCongTrai;
    
    // Right Eye (OD)
    private BigDecimal matPhaiSph;
    private BigDecimal matPhaiCyl;
    private Integer matPhaiAx;
    private BigDecimal doCongPhai;
    
    // Pupillary Distance (PD)
    private BigDecimal pd;
    
    // Lens prescription
    private String donKinh;
}
