package com.kada.da.modules.prescription.repository;

import com.kada.da.modules.prescription.domain.ChiTietKyThuat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChiTietKyThuatRepository extends JpaRepository<ChiTietKyThuat, String> {
}