package com.kada.da.Dto.Response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiaoDichNccResponseDTO {
    private String maGd;
    private String tenNhaCungCap;
    private String maPn; // Phiếu nhập liên quan (nếu có)
    private BigDecimal soTien;
    private String loaiGiaoDich;
    private String hinhThucThanhToan;
    private LocalDateTime ngayGiaoDich;
    private String nguoiThucHien; // Nhân viên kế toán đã chi tiền
    private String ghiChu;
}