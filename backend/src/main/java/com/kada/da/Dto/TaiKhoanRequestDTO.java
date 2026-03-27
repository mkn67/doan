package com.kada.da.Dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TaiKhoanRequestDTO {
    private String maTk;
    private String username;
    private String password;
    private String maNhom;
}
