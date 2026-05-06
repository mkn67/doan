package com.kada.da.Service;

import java.util.Optional;

import com.kada.da.Entity.TaiKhoan;

public interface  TaiKhoanService {
    Optional<TaiKhoan> findByUsername(String username);
    TaiKhoan createTaiKhoan(TaiKhoan taiKhoan);
    void lockTaiKhoan(String maTk);
}
