package com.kada.da.Repository;

import com.kada.da.Entity.SanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

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
}