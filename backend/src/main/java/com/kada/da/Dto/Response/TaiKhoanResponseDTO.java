package com.kada.da.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaiKhoanResponseDTO {
    private String maTk;
    private String username;
    private String maNhom;
    private String tenNhom; // Ví dụ: Quản trị viên, Nhân viên y tế
    private Integer trangThai; // 1: Hoạt động, 0: Khóa
}