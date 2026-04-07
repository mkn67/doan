package com.kada.da.Repository;

import com.kada.da.Entity.VaiTro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VaiTroRepository extends JpaRepository<VaiTro, String> {
    List<VaiTro> findByTenVaiTroContainingIgnoreCase(String keyword);
}