package com.kada.da.modules.examination.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.kada.da.modules.examination.domain.DichVuKham;

@Repository
public interface DichVuKhamRepository extends JpaRepository<DichVuKham, String> {

    // Có thể thêm hàm tìm dịch vụ theo tên nếu cần
    // List<DichVuKham> findByTenDvContaining(String tenDv);
    Page<DichVuKham> findByIsActive(Integer isActive, Pageable pageable);
}
