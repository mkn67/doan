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

    // Tìm kiếm max mã để tự tăng
    @Query("SELECT MAX(l.maLlv) FROM LichLamViec l")
    String findMaxMaLlv();

    // Các hàm kiểm tra và lấy dữ liệu đã được đổi tên cho khớp với Entity mới
    boolean existsByNhanSuAndNgayLamAndGioBatDau(NhanSu nhanSu, LocalDate ngayLam, Double gioBatDau);

    List<LichLamViec> findByNhanSuOrderByNgayLamAsc(NhanSu nhanSu);

    List<LichLamViec> findByNhanSuAndNgayLamBetween(NhanSu nhanSu, LocalDate fromDate, LocalDate toDate);

    List<LichLamViec> findByNgayLam(LocalDate ngayLam);

    List<LichLamViec> findByGioBatDauAndGioKetThuc(Double gioBatDau, Double gioKetThuc);
}