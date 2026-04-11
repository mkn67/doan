package com.kada.da.Repository;

import com.kada.da.Entity.HoSoThiLuc;
import com.kada.da.Repository.custom.HoSoThiLucRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HoSoThiLucRepository
        extends JpaRepository<HoSoThiLuc, String>,
        HoSoThiLucRepositoryCustom {
    // Lấy toàn bộ lịch sử khám mắt của 1 bệnh nhân, xếp mới nhất lên đầu
    List<HoSoThiLuc> findByKhachHang_MaKhOrderByNgayKhamDesc(String maKh);
}