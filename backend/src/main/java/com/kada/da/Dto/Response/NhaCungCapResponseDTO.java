package com.kada.da.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhaCungCapResponseDTO {
    private String maNcc;
    private String tenNcc;
    private String sdt;
    private String email;
    private String diaChi;
    private String nguoiLienHe;
    private Integer tongSoPhieuNhap;
}