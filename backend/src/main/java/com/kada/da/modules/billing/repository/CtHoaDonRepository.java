package com.kada.da.Repository;

import com.kada.da.modules.billing.domain.CtHoaDon;
import com.kada.da.modules.billing.domain.CtHoaDonId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CtHoaDonRepository extends JpaRepository<CtHoaDon, CtHoaDonId> {
}