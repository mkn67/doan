package com.kada.da.Repository;

import com.kada.da.Entity.KhachHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, String> {
    @Query("SELECT MAX(k.maKh) FROM KhachHang k")
    String findMaxMaKh();
}