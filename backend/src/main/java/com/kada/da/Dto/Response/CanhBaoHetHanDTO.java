package com.kada.da.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CanhBaoHetHanDTO {
    private String maLo;
    private String maSp;
    private String tenSp;
    private String donViTinh;
    private LocalDate ngayHetHan;
    private Long soNgayConLai;
    private Integer tonKho;
    private String mucDo;
    private String nhaCungCap;
}