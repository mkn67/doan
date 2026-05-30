package com.kada.da.modules.auth.service;

import com.kada.da.modules.auth.dto.ChangePasswordRequestDTO;
import com.kada.da.modules.auth.dto.LoginRequestDTO;
import com.kada.da.modules.auth.dto.TaiKhoanRequestDTO;
import com.kada.da.modules.auth.dto.LoginResponseDTO;
import com.kada.da.modules.auth.dto.TaiKhoanResponseDTO;

public interface AuthService {
    TaiKhoanResponseDTO register(TaiKhoanRequestDTO request);

    LoginResponseDTO login(LoginRequestDTO request);

    void changePassword(String username, ChangePasswordRequestDTO request);

    void forgotPassword(com.kada.da.modules.auth.dto.ForgotPasswordRequestDTO request);

    com.kada.da.modules.auth.dto.ProfileResponseDTO getProfile(String username);

    com.kada.da.modules.auth.dto.ProfileResponseDTO updateProfile(String username, com.kada.da.modules.auth.dto.ProfileUpdateRequestDTO request);

    void logout(String token);
}
