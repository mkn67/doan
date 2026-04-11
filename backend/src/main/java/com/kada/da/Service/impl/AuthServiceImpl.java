package com.kada.da.Service.impl;

import com.kada.da.Dto.ChangePasswordRequestDTO;
import com.kada.da.Dto.LoginRequestDTO;
import com.kada.da.Dto.TaiKhoanRequestDTO;
import com.kada.da.Dto.Response.LoginResponseDTO;
import com.kada.da.Dto.Response.TaiKhoanResponseDTO;
import com.kada.da.Entity.KhachHang;
import com.kada.da.Entity.TaiKhoan;
import com.kada.da.Enum.LoaiTaiKhoan;
import com.kada.da.Exception.BusinessRuleException;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.Repository.KhachHangRepository;
import com.kada.da.Repository.TaiKhoanRepository;
import com.kada.da.Service.AuthService;
import com.kada.da.Util.JwtTokenUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final KhachHangRepository khachHangRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;

    @Override
    @Transactional
    public TaiKhoanResponseDTO register(TaiKhoanRequestDTO request) {
        // 1. Kiểm tra username đã tồn tại
        if (taiKhoanRepository.existsByUsername(request.getUsername())) {
            throw new BusinessRuleException("Tên đăng nhập đã tồn tại");
        }

        // 2. Tạo tài khoản mới
        String maTk = generateMaTk();
        TaiKhoan taiKhoan = TaiKhoan.builder()
                .maTk(maTk)
                .username(request.getUsername()) // ĐÃ FIX: Sửa lỗi cú pháp và đổi thành username
                .password(passwordEncoder.encode(request.getPassword())) // ĐÃ FIX: Đổi từ matKhau -> password
                .loaiTk(request.getLoaiTk())
                .trangThai(1) // 1: hoạt động
                .build();
        taiKhoan = taiKhoanRepository.save(taiKhoan);
        log.info("Đã tạo tài khoản: {}", maTk);

        // 3. Nếu là tài khoản khách hàng (EXTERNAL) -> tự động tạo KhachHang
        if (LoaiTaiKhoan.EXTERNAL.name().equals(request.getLoaiTk())) {
            String maKh = generateMaKh();
            KhachHang khachHang = KhachHang.builder()
                    .maKh(maKh)
                    .taiKhoan(taiKhoan)
                    .hoTen(request.getHoTen() != null ? request.getHoTen() : request.getUsername())
                    .sdt(request.getSdt() != null ? request.getSdt() : "")
                    .diaChi(request.getDiaChi())
                    .diemTichLuy(0)
                    .isDeleted(0)
                    .build();
            khachHangRepository.save(khachHang);
            log.info("Đã tạo khách hàng: {} cho tài khoản: {}", maKh, maTk);
        }

        // 4. Trả về response
        return TaiKhoanResponseDTO.builder()
                .maTk(taiKhoan.getMaTk())
                .username(taiKhoan.getUsername()) // ĐÃ FIX: getTenDangNhap() -> getUsername()
                .loaiTk(taiKhoan.getLoaiTk())
                .trangThai(taiKhoan.getTrangThai())
                .build();
    }

    @Override
    public LoginResponseDTO login(LoginRequestDTO request) {
        TaiKhoan taiKhoan = taiKhoanRepository.findByUsername(request.getUsername()) // ĐÃ FIX
                .orElseThrow(() -> new BusinessRuleException("Sai tên đăng nhập hoặc mật khẩu"));

        if (!passwordEncoder.matches(request.getPassword(), taiKhoan.getPassword())) {
            throw new BusinessRuleException("Sai tên đăng nhập hoặc mật khẩu");
        }

        if (taiKhoan.getTrangThai() == null || taiKhoan.getTrangThai() == 0) {
            throw new BusinessRuleException("Tài khoản đã bị khóa");
        }

        List<String> roles = taiKhoan.getDanhSachNhom().stream()
                .map(nhom -> nhom.getMaNhom())
                .collect(Collectors.toList());

        String token = jwtTokenUtil.generateToken(taiKhoan.getUsername(), roles); // Dùng username thay password để làm
                                                                                  // subject JWT

        return LoginResponseDTO.builder()
                .token(token)
                .username(taiKhoan.getUsername())
                .loaiTk(taiKhoan.getLoaiTk())
                .build();
    }

    private String generateMaTk() {
        String maxMa = taiKhoanRepository.findMaxMaTk();
        int nextNumber = 1;
        if (maxMa != null && maxMa.length() > 2) {
            try {
                nextNumber = Integer.parseInt(maxMa.substring(2)) + 1;
            } catch (NumberFormatException e) {
                log.warn("Không thể parse mã tài khoản: {}", maxMa);
            }
        }
        return "TK" + String.format("%03d", nextNumber);
    }

    private String generateMaKh() {
        String maxMa = khachHangRepository.findMaxMaKh();
        int nextNumber = 1;
        if (maxMa != null && maxMa.length() > 2) {
            try {
                nextNumber = Integer.parseInt(maxMa.substring(2)) + 1;
            } catch (NumberFormatException e) {
                log.warn("Không thể parse mã khách hàng: {}", maxMa);
            }
        }
        return "KH" + String.format("%03d", nextNumber);
    }

    @Override
    @Transactional
    public void changePassword(String username, ChangePasswordRequestDTO request) {
        log.info("Bắt đầu đổi mật khẩu cho tài khoản: {}", username);

        // 1. Kiểm tra mật khẩu mới và xác nhận có khớp không
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessRuleException("Mật khẩu xác nhận không khớp với mật khẩu mới!");
        }

        // 2. Tìm tài khoản trong DB (Tùy Entity của ông tên là TaiKhoan hay User nhé)
        TaiKhoan taiKhoan = taiKhoanRepository.findById(username) // hoặc findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản: " + username));

        // 3. Kiểm tra mật khẩu cũ có đúng không
        // LƯU Ý: Nếu ông dùng BCrypt thì dùng passwordEncoder.matches(), nếu ông lưu
        // plain-text thì dùng .equals()
        if (!passwordEncoder.matches(request.getOldPassword(), taiKhoan.getPassword())) {
            throw new BusinessRuleException("Mật khẩu cũ không chính xác!");
        }

        // 4. Mã hóa mật khẩu mới và lưu lại
        taiKhoan.setPassword(passwordEncoder.encode(request.getNewPassword()));
        taiKhoanRepository.save(taiKhoan);

        log.info("Đổi mật khẩu thành công cho tài khoản: {}", username);
    }
}