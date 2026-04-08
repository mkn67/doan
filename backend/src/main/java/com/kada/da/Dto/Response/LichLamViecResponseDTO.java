package com.kada.da.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LichLamViecResponseDTO {
    private String maLlv;
    private String tenNhanSu;
    private String chucVu;
    private LocalDate ngayLam;
    private Double gioBatDau;
    private Double gioKetThuc;
    private Integer isNghi;
}