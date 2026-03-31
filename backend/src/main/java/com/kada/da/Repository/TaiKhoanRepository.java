package com.kada.da.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.kada.da.Entity.TaiKhoan;

@Repository
public interface  TaiKhoanRepository extends JpaRepository<TaiKhoan, String>{
    Optional<TaiKhoan> findByUsername(String username);
}
