package com.kada.da.Dto;

import lombok.Data;

@Data
public class TaiKhoanRequestDTO {
    private String maTk;
    private String username;
    private String password;
    private String loaiTk;
    private String hoTen;
    private String sdt;
    private String diaChi;
    private String maNhom;
}