package com.kada.da.modules.auth.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class LoginResponseDTO {

    private String token;
    private String username;
    private String maNhom;
    private String loaiTk;
    private List<String> roles;
    private String maKh;
    private String maNs;
    private String hoTen;
    private String sdt;
}
