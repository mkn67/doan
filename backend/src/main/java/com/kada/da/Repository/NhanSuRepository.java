package com.kada.da.Repository;

import com.kada.da.Entity.NhanSu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NhanSuRepository extends JpaRepository<NhanSu, String> {

    // Đây là "phép thuật" của Spring Data JPA:
    // Nó sẽ tự phân tích tên hàm này để tạo ra câu SQL:
    // SELECT * FROM NHAN_SU WHERE LOWER(HO_TEN) LIKE LOWER('%keyword%')
    Page<NhanSu> findByHoTenContainingIgnoreCase(String hoTen, Pageable pageable);
}