package com.kada.da.Dto.Response;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichLamViecResponseDTO {
    private String maLlv;
    private String tenNhanSu;
    private String chucVu;
    private LocalDate ngay;
    private String ca;
    private String trangThai; // Ví dụ: Đã xác nhận, Xin nghỉ, Thay đổi
    private String ghiChu;
}