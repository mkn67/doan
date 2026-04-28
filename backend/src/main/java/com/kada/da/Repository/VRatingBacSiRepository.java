package com.kada.da.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.kada.da.Entity.VRatingBacSi;

@Repository
public interface VRatingBacSiRepository extends JpaRepository<VRatingBacSi, String> {

    // Tự động sinh SQL: Sắp xếp theo Rating giảm dần (từ 5 sao xuống)
    List<VRatingBacSi> findAllByOrderByRatingTrungBinhDesc();

    // Tìm theo chuyên khoa (Ví dụ: Lấy top bác sĩ khoa Mắt)
    List<VRatingBacSi> findByChuyenKhoaOrderByRatingTrungBinhDesc(String chuyenKhoa);
}