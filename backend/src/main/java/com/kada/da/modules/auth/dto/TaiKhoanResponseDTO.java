package com.kada.da.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaiKhoanResponseDTO {
    private String maTk;
    private String username;
    private String loaiTk;
    private Integer trangThai;
}