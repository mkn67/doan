package com.kada.da.Repository;

import com.kada.da.Entity.CtKeDon;
import com.kada.da.Entity.CtKeDonId; // Khóa chính tổng hợp
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CtKeDonRepository extends JpaRepository<CtKeDon, CtKeDonId> {
    List<CtKeDon> findByPhieuKeDon_MaDon(String maDon);
}