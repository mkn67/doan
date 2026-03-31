package com.kada.da.Service;

import com.kada.da.Dto.LoginRequestDTO;
import com.kada.da.Dto.LoginResponseDTO;

public interface AuthService {
    LoginResponseDTO login(LoginRequestDTO request);
}