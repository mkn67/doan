package com.kada.da.Repository;

import com.kada.da.Entity.NhaCungCap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NhaCungCapRepository extends JpaRepository<NhaCungCap, String> {

    // Kiểm tra trùng lặp
    boolean existsByTenNcc(String tenNcc);

    boolean existsBySdt(String sdt);

    // Lấy mã NCC lớn nhất để tự động tăng (NCC001, NCC002)
    @Query("SELECT MAX(n.maNcc) FROM NhaCungCap n")
    String findMaxMaNcc();

    // Kiểm tra xem NCC đã có phiếu nhập nào chưa (trước khi xóa)
    // Giả định ông có thiết lập quan hệ OneToMany trong Entity NhaCungCap.
    // Nếu không có, dùng câu query trực tiếp:
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN TRUE ELSE FALSE END FROM PhieuNhap p WHERE p.nhaCungCap.maNcc = :maNcc")
    boolean hasPhieuNhap(@Param("maNcc") String maNcc);
}