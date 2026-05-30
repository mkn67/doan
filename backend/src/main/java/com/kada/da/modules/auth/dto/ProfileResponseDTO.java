package com.kada.da.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponseDTO {
    private String username;
    private String hoTen;
    private String sdt;
    private String diaChi;
    private String loaiTk;
    private List<String> roles;
    private String actorId;
}
