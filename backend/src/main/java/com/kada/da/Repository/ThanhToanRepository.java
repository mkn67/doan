package com.kada.da.Repository;

import com.kada.da.Entity.ThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThanhToanRepository extends JpaRepository<ThanhToan, String> {

    // Tìm mã để tự tăng TT001, TT002...
    @Query("SELECT MAX(t.maTt) FROM ThanhToan t")
    String findMaxMaTt();

    // Tìm các lần thanh toán của 1 hóa đơn cụ thể (nếu khách trả góp nhiều lần)
    List<ThanhToan> findByHoaDon_MaHd(String maHd);

    // Tìm lịch sử thu tiền của 1 nhân viên (phục vụ báo cáo chốt ca)
    List<ThanhToan> findByNhanSu_MaNsOrderByNgayThanhToanDesc(String maNs);
}