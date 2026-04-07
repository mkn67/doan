package com.kada.da.Repository;

import com.kada.da.Entity.Nhom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface NhomRepository extends JpaRepository<Nhom, String> {
    // Hàm này cực kỳ cần cho lúc phân quyền (Load quyền từ tên nhóm)
    Optional<Nhom> findByTenNhom(String tenNhom);

    boolean existsByTenNhom(String tenNhom);

    List<Nhom> findByVaiTros_MaVaiTro(String maVaiTro);
}