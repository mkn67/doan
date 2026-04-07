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
public class NhanSuResponseDTO {
    private String maNs;
    private String hoTen;
    private String sdt;
    private String email;
    private String diaChi;
    private LocalDate ngaySinh;
    private String gioiTinh;
    private String tenChucVu;
    private String cccd;
    // Đính kèm thông tin tài khoản (nếu có)
    private TaiKhoanResponseDTO taiKhoan;
}