package com.kada.da.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditHosoThilucDTO {
    private String maHoSo;
    private String tenKhachHang;
    private String nguoiThayDoi; // Tên bác sĩ hoặc Admin đã thực hiện sửa

    private LocalDateTime thoiGianThayDoi;

    private String ketLuanCu; // Kết luận trước khi sửa
    private String ketLuanMoi; // Kết luận sau khi sửa

    private String lyDoThayDoi; // Ví dụ: "Nhập sai kết quả đo mắt MP"
}