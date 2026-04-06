package com.kada.da.Repository;

import com.kada.da.Entity.HangCho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface HangChoRepository extends JpaRepository<HangCho, String> {

    @Query("SELECT MAX(h.soThuTu) FROM HangCho h WHERE CAST(h.gioDangKy AS date) = CURRENT_DATE()")
    Integer findMaxSoThuTuToday();
}