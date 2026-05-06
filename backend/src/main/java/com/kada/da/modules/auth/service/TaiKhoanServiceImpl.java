package com.kada.da.modules.auth.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kada.da.modules.auth.domain.TaiKhoan;
import com.kada.da.modules.auth.repository.TaiKhoanRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaiKhoanServiceImpl implements TaiKhoanService {

    private final TaiKhoanRepository taiKhoanRepository;

    @Override
    public Optional<TaiKhoan> findByUsername(String username) {
        return taiKhoanRepository.findByUsername(username); // ĐÃ FIX
    }

    @Override
    @Transactional
    public TaiKhoan createTaiKhoan(TaiKhoan taiKhoan) {
        if (taiKhoanRepository.findByUsername(taiKhoan.getUsername()).isPresent()) { // ĐÃ FIX
            throw new RuntimeException("Tên đăng nhập đã tồn tại trong hệ thống!");
        }

        taiKhoan.setTrangThai(1);
        return taiKhoanRepository.save(taiKhoan);
    }

    @Override
    @Transactional
    public void lockTaiKhoan(String maTk) {
        TaiKhoan taiKhoan = taiKhoanRepository.findById(maTk)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với mã: " + maTk));

        taiKhoan.setTrangThai(0);
        taiKhoanRepository.save(taiKhoan);
    }
}
