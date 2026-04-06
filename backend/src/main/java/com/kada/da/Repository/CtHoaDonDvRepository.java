package com.kada.da.Repository;

import com.kada.da.Entity.CtHoaDonDv;
import com.kada.da.Entity.CtHoaDonDvId; // Khóa chính tổng hợp
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CtHoaDonDvRepository extends JpaRepository<CtHoaDonDv, CtHoaDonDvId> {
    List<CtHoaDonDv> findByHoaDon_MaHd(String maHd);
}