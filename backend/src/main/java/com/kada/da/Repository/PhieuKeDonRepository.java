package com.kada.da.Repository;

import com.kada.da.Entity.PhieuKeDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhieuKeDonRepository extends JpaRepository<PhieuKeDon, String> {

    // Tìm đơn thuốc dựa vào mã Hồ sơ thị lực
    List<PhieuKeDon> findByHoSoThiLuc_MaHoSoOrderByNgayKeDonDesc(String maHoSo);

    // Lấy mã đơn lớn nhất để tự sinh PK001, PK002
    @Query("SELECT MAX(p.maDon) FROM PhieuKeDon p")
    String findMaxMaDon();
}