package com.kada.da.Repository;

import com.kada.da.Entity.HangCho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HangChoRepository extends JpaRepository<HangCho, String> {

    // Lấy số thứ tự lớn nhất trong ngày hôm nay để tăng lên 1
    // Câu Query này chạy trên Oracle/Postgres đều ổn
    @Query("SELECT MAX(h.soThuTu) FROM HangCho h WHERE CAST(h.thoiGianDangKy AS date) = CURRENT_DATE")
    Optional<Integer> findMaxSoThuTuToday();
}