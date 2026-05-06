package com.kada.da.modules.inventory.repository;

import com.kada.da.modules.inventory.domain.LoaiSanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoaiSanPhamRepository extends JpaRepository<LoaiSanPham, String> {
}