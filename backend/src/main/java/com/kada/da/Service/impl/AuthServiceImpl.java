package com.kada.da.Service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.kada.da.Dto.LoginRequestDTO;
import com.kada.da.Dto.LoginResponseDTO;
import com.kada.da.Entity.TaiKhoan;
import com.kada.da.Entity.Nhom;
import com.kada.da.Repository.TaiKhoanRepository;
import com.kada.da.Service.AuthService;
import com.kada.da.Util.JwtTokenUtil;

import lombok.RequiredArgsConstructor;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;

    @Override
    public LoginResponseDTO login(LoginRequestDTO request) {
        // 1. Tìm tài khoản theo tenDangNhap (Đã đổi tên biến)
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Sai tên đăng nhập hoặc mật khẩu!"));

        // 2. Kiểm tra mật khẩu (Sử dụng getMatKhau)
        if (!passwordEncoder.matches(request.getPassword(), taiKhoan.getMatKhau())) {
            throw new RuntimeException("Sai tên đăng nhập hoặc mật khẩu!");
        }

        // 3. Kiểm tra trạng thái
        if (taiKhoan.getTrangThai() != null && taiKhoan.getTrangThai() == 0) {
            throw new RuntimeException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin!");
        }

        // 4. Lấy danh sách mã nhóm (Vì 1 người giờ có nhiều nhóm)
        String dsMaNhom = "";
        if (taiKhoan.getDanhSachNhom() != null && !taiKhoan.getDanhSachNhom().isEmpty()) {
            // Nối các mã nhóm lại thành chuỗi, cách nhau bởi dấu phẩy
            dsMaNhom = taiKhoan.getDanhSachNhom().stream()
                    .map(Nhom::getMaNhom)
                    .collect(Collectors.joining(","));
        }

        // 5. Tạo JWT Token
        String token = jwtTokenUtil.generateToken(taiKhoan.getTenDangNhap(), dsMaNhom);

        // 6. Trả về kết quả
        return LoginResponseDTO.builder()
                .token(token)
                .username(taiKhoan.getTenDangNhap())
                .maNhom(dsMaNhom)
                .build();
    }
}