package com.kada.da.Repository;

import com.kada.da.Entity.PhieuKeDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PhieuKeDonRepository extends JpaRepository<PhieuKeDon, String> {
    // Lấy lịch sử kê đơn thuốc của bệnh nhân
    List<PhieuKeDon> findByKhachHang_MaKhOrderByNgayKeDesc(String maKh);
}