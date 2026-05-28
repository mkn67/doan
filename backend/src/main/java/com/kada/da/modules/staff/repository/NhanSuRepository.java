package com.kada.da.modules.staff.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.kada.da.modules.staff.domain.NhanSu;

@Repository
public interface NhanSuRepository extends JpaRepository<NhanSu, String> {

    // Đây là "phép thuật" của Spring Data JPA:
    // Nó sẽ tự phân tích tên hàm này để tạo ra câu SQL:
    // SELECT * FROM NHAN_SU WHERE LOWER(HO_TEN) LIKE LOWER('%keyword%')
    Page<NhanSu> findByHoTenContainingIgnoreCase(String hoTen, Pageable pageable);

    List<NhanSu> findByChucVu_MaCvAndIsDeleted(String maCv, Integer isDeleted);

    Page<NhanSu> findByIsDeleted(Integer isDeleted, Pageable pageable);

    Page<NhanSu> findByHoTenContainingIgnoreCaseAndIsDeleted(String hoTen, Integer isDeleted, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT n FROM NhanSu n WHERE n.taiKhoan.username = :username")
    java.util.Optional<NhanSu> findByTaiKhoanUsername(@org.springframework.data.repository.query.Param("username") String username);
}
