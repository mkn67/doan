package com.kada.da.Repository;

import com.kada.da.Entity.LichLamViec;
import com.kada.da.Entity.NhanSu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LichLamViecRepository extends JpaRepository<LichLamViec, String> {

    // Lấy lịch theo nhân sự, sắp xếp theo ngày tăng dần
    List<LichLamViec> findByNhanSuOrderByNgayLamViecAsc(NhanSu nhanSu);

    // Lấy lịch theo nhân sự và khoảng ngày
    List<LichLamViec> findByNhanSuAndNgayLamViecBetween(NhanSu nhanSu, LocalDate fromDate, LocalDate toDate);

    // Lấy lịch theo ngày
    List<LichLamViec> findByNgayLamViec(LocalDate ngay);

    // Lấy lịch theo ca
    List<LichLamViec> findByCa(String ca);

    // Kiểm tra tồn tại lịch của nhân sự theo ngày và ca
    boolean existsByNhanSuAndNgayLamViecAndCa(NhanSu nhanSu, LocalDate ngay, String ca);

    // Lấy mã lớn nhất để sinh tự động
    @Query("SELECT MAX(l.maLlv) FROM LichLamViec l")
    String findMaxMaLlv();
}