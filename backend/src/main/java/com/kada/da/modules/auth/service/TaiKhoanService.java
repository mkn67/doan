package com.kada.da.modules.auth.service;

import java.util.Optional;

import com.kada.da.modules.auth.domain.TaiKhoan;

public interface  TaiKhoanService {
    Optional<TaiKhoan> findByUsername(String username);
    TaiKhoan createTaiKhoan(TaiKhoan taiKhoan);
    void lockTaiKhoan(String maTk);
}
