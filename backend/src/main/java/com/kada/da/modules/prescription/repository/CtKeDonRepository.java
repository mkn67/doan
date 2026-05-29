package com.kada.da.modules.prescription.repository;

import com.kada.da.modules.prescription.domain.CtKeDon;
import com.kada.da.modules.prescription.domain.CtKeDonId; // Khóa chính tổng hợp
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CtKeDonRepository extends JpaRepository<CtKeDon, CtKeDonId> {
    List<CtKeDon> findByPhieuKeDon_MaDon(String maDon);

    @Query("SELECT COALESCE(SUM(ct.soLuong), 0) FROM CtKeDon ct " +
           "WHERE ct.sanPham.maSp = :maSp " +
           "AND ct.phieuKeDon.maDon NOT IN (" +
           "  SELECT hd.phieuKeDon.maDon FROM HoaDon hd " +
           "  WHERE hd.phieuKeDon IS NOT NULL " +
           "  AND hd.trangThai != 'Đã hủy' " +
           "  AND (hd.isDeleted IS NULL OR hd.isDeleted = 0)" +
           ")")
    int getReservedQuantity(@Param("maSp") String maSp);
}