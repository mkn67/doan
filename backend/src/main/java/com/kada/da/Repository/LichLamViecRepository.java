package com.kada.da.Repository;

import com.kada.da.Entity.LichLamViec;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface LichLamViecRepository extends JpaRepository<LichLamViec, String> {
    List<LichLamViec> findByNhanSu_MaNsAndNgayLamViec(String maNs, LocalDate ngay);
}