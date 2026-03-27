package com.kada.da.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.kada.da.Entity.KhachHang;

@Repository
public interface  KhachHangRepository extends JpaRepository<KhachHang, String>{
    Optional<KhachHang> findBySdt(String sdt);
    Optional<KhachHang> findByTaiKhoan_MaTk(String maTk);
}
