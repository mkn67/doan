package com.kada.da.modules.inventory.repository;

import com.kada.da.modules.inventory.domain.SanPham;

import org.springframework.data.jpa.repository.EntityGraph;
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

    @EntityGraph(attributePaths = { "danhSachLoHang" })
    @Query("SELECT sp FROM SanPham sp")
    List<SanPham> findAllKemLoHang();
    // Trở lại file Service, thay vì gọi findAll(), ông gọi findAllKemLoHang() là
}