package com.kada.da.Repository;

import com.kada.da.Entity.SanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SanPhamRepository extends JpaRepository<SanPham, String> {
    // Lấy danh sách sản phẩm (thuốc/tròng kính/gọng kính) theo mã loại
    List<SanPham> findByLoaiSanPham_MaLoai(String maLoai);
}