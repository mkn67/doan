package com.kada.da.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhieuNhapResponseDTO {
    private String maPn;
    private String maNcc;
    private String tenNcc;
    private String maNs;
    private String tenNhanVien;
    private LocalDateTime ngayNhap;
    private BigDecimal tongTien;
    private List<LoHangResponseDTO> loHangList;
}