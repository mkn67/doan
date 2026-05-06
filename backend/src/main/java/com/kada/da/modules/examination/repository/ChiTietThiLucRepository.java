package com.kada.da.Repository;

import com.kada.da.modules.examination.domain.ChiTietThiLuc;
import com.kada.da.modules.examination.domain.ChiTietThiLucId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChiTietThiLucRepository extends JpaRepository<ChiTietThiLuc, ChiTietThiLucId> {
    // Tìm chi tiết thị lực theo mã hồ sơ
    List<ChiTietThiLuc> findByHoSoThiLuc_MaHoSo(String maHoSo);
}