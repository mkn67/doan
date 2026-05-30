package com.kada.da.modules.booking.repository;

import com.kada.da.modules.booking.domain.LichLamViec;
import com.kada.da.modules.staff.domain.NhanSu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LichLamViecRepository extends JpaRepository<LichLamViec, String> {

        // =========================================================
        // 1. Query hỗ trợ tạo lịch làm việc
        // =========================================================
        // =========================================================
        // 2. CÁC QUERY MẶC ĐỊNH CỦA JPA (Dùng để hiển thị dữ liệu)
        // =========================================================
        boolean existsByNhanSuAndNgayLamAndGioBatDau(NhanSu nhanSu, LocalDate ngayLam, Double gioBatDau);

        List<LichLamViec> findByNhanSuOrderByNgayLamAsc(NhanSu nhanSu);

        List<LichLamViec> findByNhanSuAndNgayLamBetween(NhanSu nhanSu, LocalDate fromDate, LocalDate toDate);

        List<LichLamViec> findByNgayLam(LocalDate ngayLam);

        List<LichLamViec> findByGioBatDauAndGioKetThuc(Double gioBatDau, Double gioKetThuc);

        @Query("""
                        SELECT l FROM LichLamViec l
                        WHERE l.nhanSu.maNs = :maNs
                          AND l.ngayLam = :ngayLam
                          AND l.isNghi = 0
                          AND :gioBatDau < l.gioKetThuc
                          AND :gioKetThuc > l.gioBatDau
                        """)
        List<LichLamViec> findOverlappingWorkingSlots(
                        @Param("maNs") String maNs,
                        @Param("ngayLam") LocalDate ngayLam,
                        @Param("gioBatDau") Double gioBatDau,
                        @Param("gioKetThuc") Double gioKetThuc);

        @org.springframework.data.jpa.repository.Query("SELECT l FROM LichLamViec l WHERE l.isNghi = 0 AND l.ngayLam = :ngayLam")
        List<LichLamViec> findByIsNghiFalseAndNgayLam(@org.springframework.data.repository.query.Param("ngayLam") LocalDate ngayLam);

        @org.springframework.data.jpa.repository.Query("SELECT l FROM LichLamViec l WHERE l.isNghi = 0 AND l.ngayLam >= :ngayLam")
        List<LichLamViec> findByIsNghiFalseAndNgayLamGreaterThanEqual(@org.springframework.data.repository.query.Param("ngayLam") LocalDate ngayLam);
}
