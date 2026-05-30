package com.kada.da.modules.examination.repository;

import com.kada.da.modules.examination.domain.AuditHosoThiluc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditHosoThilucRepository extends JpaRepository<AuditHosoThiluc, String> {
    List<AuditHosoThiluc> findByMaHoSoOrderByThoiGianDesc(String maHoSo);
}
