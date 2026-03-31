package com.kada.da.Service.impl;

// Đây là phần import bị thiếu của bạn
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.kada.da.Dto.LoginRequestDTO;
import com.kada.da.Dto.LoginResponseDTO;
import com.kada.da.Entity.TaiKhoan;
import com.kada.da.Repository.TaiKhoanRepository;
import com.kada.da.Service.AuthService;
import com.kada.da.Util.JwtTokenUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;

    @Override
    public LoginResponseDTO login(LoginRequestDTO request) {
        // 1. Tìm tài khoản trong Database
        TaiKhoan taiKhoan = taiKhoanRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Sai tên đăng nhập hoặc mật khẩu!"));

        // 2. Kiểm tra mật khẩu (Dùng BCrypt)
        if (!passwordEncoder.matches(request.getPassword(), taiKhoan.getPassword())) {
            throw new RuntimeException("Sai tên đăng nhập hoặc mật khẩu!");
        }

        // 3. Kiểm tra trạng thái tài khoản (1: Hoạt động, 0: Bị khóa)
        if (taiKhoan.getTrangThai() != null && taiKhoan.getTrangThai() == 0) {
            throw new RuntimeException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin!");
        }

        // 4. Lấy mã nhóm 
        String maNhom = "";
        if (taiKhoan.getNhom() != null) {
            maNhom = taiKhoan.getNhom().getMaNhom();
        }

        // 5. Tạo JWT Token
        String token = jwtTokenUtil.generateToken(taiKhoan.getUsername(), maNhom);

        // 6. Trả về kết quả
        return LoginResponseDTO.builder()
                .token(token)
                .username(taiKhoan.getUsername())
                .maNhom(maNhom)
                .build();
    }
}