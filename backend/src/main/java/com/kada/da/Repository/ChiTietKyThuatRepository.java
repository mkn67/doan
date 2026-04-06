package com.kada.da.Repository;

import com.kada.da.Entity.ChiTietKyThuat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChiTietKyThuatRepository extends JpaRepository<ChiTietKyThuat, String> {
}