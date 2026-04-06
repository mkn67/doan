package com.kada.da.Repository;

import com.kada.da.Entity.DichVuKham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DichVuKhamRepository extends JpaRepository<DichVuKham, String> {
    // Có thể thêm hàm tìm dịch vụ theo tên nếu cần
    // List<DichVuKham> findByTenDvContaining(String tenDv);
}