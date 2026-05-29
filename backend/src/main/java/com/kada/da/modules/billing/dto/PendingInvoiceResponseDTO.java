package com.kada.da.modules.billing.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingInvoiceResponseDTO {
    private String maKh;
    private String tenKhachHang;
    private String sdtKhachHang;
    private String maHoSo;
    private LocalDateTime ngayKham;
    private String maDon;
    private LocalDateTime ngayKeDon;
    private String loaiKham; // e.g. "Khám mắt", "Đơn kính/thuốc", "Khám & Đơn kính/thuốc"
}
