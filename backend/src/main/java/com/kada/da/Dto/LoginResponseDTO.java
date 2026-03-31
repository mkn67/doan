package com.kada.da.Dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data @AllArgsConstructor @Builder
public class LoginResponseDTO {
    private String token;
    private String username;
    private String maNhom;
}
