package com.kada.da.Repository;

import com.kada.da.Entity.GoiKham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GoiKhamRepository extends JpaRepository<GoiKham, String> {
    // Tìm gói khám theo tên nếu cần hiển thị lên combo box ở Frontend
    // List<GoiKham> findByTenGoiContaining(String tenGoi);
}