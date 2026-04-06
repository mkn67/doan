package com.kada.da.Repository;

import com.kada.da.Entity.PhieuNhap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PhieuNhapRepository extends JpaRepository<PhieuNhap, String> {
    // Tìm phiếu nhập theo nhà cung cấp
    List<PhieuNhap> findByNhaCungCap_MaNcc(String maNcc);
}