package com.kada.da.Service;

import com.kada.da.Dto.ChangePasswordRequestDTO;
import com.kada.da.Dto.LoginRequestDTO;
import com.kada.da.Dto.TaiKhoanRequestDTO;
import com.kada.da.Dto.Response.LoginResponseDTO;
import com.kada.da.Dto.Response.TaiKhoanResponseDTO;

public interface AuthService {
    TaiKhoanResponseDTO register(TaiKhoanRequestDTO request);

    LoginResponseDTO login(LoginRequestDTO request);

    void changePassword(String username, ChangePasswordRequestDTO request);
}