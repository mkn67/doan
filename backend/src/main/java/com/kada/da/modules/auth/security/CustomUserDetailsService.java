package com.kada.da.modules.auth.security;

import com.kada.da.modules.auth.domain.TaiKhoan;
import com.kada.da.modules.auth.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final TaiKhoanRepository taiKhoanRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        TaiKhoan taiKhoan = taiKhoanRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy user: " + username));

        // Map danh sách nhóm (NHOM) thành GrantedAuthority (ROLE_)
        List<SimpleGrantedAuthority> authorities = taiKhoan.getDanhSachNhom().stream()
                .map(nhom -> new SimpleGrantedAuthority("ROLE_" + nhom.getMaNhom()))
                .collect(Collectors.toList());

        // Kiểm tra trạng thái tài khoản (1 là hoạt động)
        boolean isEnabled = (taiKhoan.getTrangThai() != null && taiKhoan.getTrangThai() == 1);

        // Trả về UserDetails chuẩn của Spring Security
        return new User(
                taiKhoan.getUsername(),
                taiKhoan.getPassword(),
                isEnabled,
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                authorities
        );
    }
}
