package com.kada.da.Repository;

import com.kada.da.Entity.ChucVu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChucVuRepository extends JpaRepository<ChucVu, String> {
    // Kế thừa sẵn các hàm cơ bản: save(), findById(), findAll(), deleteById()

    // Nếu ông muốn mở rộng, có thể thêm một số hàm tìm kiếm đặc thù:
    // Ví dụ: Tìm chức vụ theo tên (giả sử để check trùng lúc tạo mới)
    // Optional<ChucVu> findByTenCv(String tenCv);
}