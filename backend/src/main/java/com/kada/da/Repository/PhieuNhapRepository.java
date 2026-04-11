package com.kada.da.Repository;

import com.kada.da.Entity.NhaCungCap;
import com.kada.da.Entity.PhieuNhap;
import com.kada.da.Repository.custom.PhieuNhapRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhieuNhapRepository
        extends JpaRepository<PhieuNhap, String>,
        PhieuNhapRepositoryCustom {

    // Tìm các phiếu nhập của một nhà cung cấp cụ thể, sắp xếp mới nhất lên đầu
    List<PhieuNhap> findByNhaCungCapOrderByNgayNhapDesc(NhaCungCap nhaCungCap);

    // Lấy mã phiếu nhập lớn nhất trong một ngày cụ thể (Ví dụ: truyền vào
    // "20260407")
    // Câu query này dùng hàm LIKE để tìm những mã bắt đầu bằng PN20260407...
    @Query("SELECT MAX(p.maPn) FROM PhieuNhap p WHERE p.maPn LIKE CONCAT('PN', :dateString, '%')")
    String findMaxMaPnByDate(@Param("dateString") String dateString);
}