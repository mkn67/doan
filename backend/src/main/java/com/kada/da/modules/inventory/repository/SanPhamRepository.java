package com.kada.da.modules.inventory.repository;

import com.kada.da.modules.inventory.domain.SanPham;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

@Repository
public interface SanPhamRepository extends JpaRepository<SanPham, String> {

    // Tìm mã Sản phẩm lớn nhất để tự động tăng (SP001 -> SP002)
    @Query("SELECT MAX(s.maSp) FROM SanPham s")
    String findMaxMaSp();

    // Tìm kiếm tất cả các sản phẩm là thuốc (laThuoc = 1) hoặc không phải thuốc
    // (laThuoc = 0)
    List<SanPham> findByLaThuoc(Integer laThuoc);

    // Tìm kiếm sản phẩm theo Loại sản phẩm
    List<SanPham> findByLoaiSanPham_MaLoai(String maLoai);

    @EntityGraph(attributePaths = { "danhSachLoHang" })
    @Query("SELECT sp FROM SanPham sp")
    List<SanPham> findAllKemLoHang();

    // Khóa bi quan (SELECT FOR UPDATE) để đồng bộ hóa và chống Race Condition khi giữ chỗ tồn kho
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM SanPham s WHERE s.maSp = :maSp")
    Optional<SanPham> findByIdWithWriteLock(@Param("maSp") String maSp);
}