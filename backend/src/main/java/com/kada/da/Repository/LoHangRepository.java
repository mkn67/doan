package com.kada.da.Repository;

import com.kada.da.Entity.LoHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoHangRepository extends JpaRepository<LoHang, String> {
}