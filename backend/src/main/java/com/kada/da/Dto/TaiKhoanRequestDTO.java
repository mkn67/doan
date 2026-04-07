package com.kada.da.Dto; // Nên đưa vào sub-package Request cho gọn

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaiKhoanRequestDTO {

    private String maTk;

    @NotBlank(message = "Username không được để trống")
    @Size(min = 4, max = 50, message = "Username phải từ 4 đến 50 ký tự")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
    private String password;

    @NotBlank(message = "Phải gắn tài khoản này với một nhân sự")
    private String maNs;

    @NotBlank(message = "Phải phân nhóm quyền cho tài khoản")
    private String maNhom;
}