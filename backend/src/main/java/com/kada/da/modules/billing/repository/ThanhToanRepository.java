package com.kada.da.modules.billing.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.kada.da.modules.billing.domain.ThanhToan;
import com.kada.da.modules.billing.repository.custom.ThanhToanRepositoryCustom;

@Repository
public interface ThanhToanRepository
        extends JpaRepository<ThanhToan, String>,
        ThanhToanRepositoryCustom {

    // 1. Tìm mã lớn nhất để tự tăng TT001, TT002...
    @Query("SELECT MAX(t.maTt) FROM ThanhToan t")
    String findMaxMaTt();

    // 2. Tìm các lần thanh toán của 1 hóa đơn (Dùng cho lịch sử thanh toán chi tiết)
    List<ThanhToan> findByHoaDon_MaHd(String maHd);

    // 3. Tìm lịch sử thu tiền của nhân viên theo thời gian (Báo cáo chốt ca)
    List<ThanhToan> findByNhanSu_MaNsAndNgayThanhToanBetweenOrderByNgayThanhToanDesc(
            String maNs, LocalDateTime start, LocalDateTime end);

    // 4. Tìm thanh toán theo ngày (Dùng cho Dashboard xem doanh thu hôm nay)
    List<ThanhToan> findByNgayThanhToanBetween(LocalDateTime start, LocalDateTime end);

    // 5. Tìm kiếm theo tên khách hàng hoặc mã hóa đơn (Search ở trang Payments)
    @Query("SELECT t FROM ThanhToan t WHERE "
            + "LOWER(t.hoaDon.maHd) LIKE LOWER(CONCAT('%', :keyword, '%')) OR "
            + "LOWER(t.hoaDon.khachHang.hoTen) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<ThanhToan> searchByKeyword(@Param("keyword") String keyword);

    // =======================================================
    // PHẦN THỐNG KÊ (AGGREGATION) - CỰC KỲ QUAN TRỌNG CHO DASHBOARD
    // =======================================================
    // 6. Tính tổng doanh thu trong một khoảng thời gian
    @Query("SELECT SUM(t.soTien) FROM ThanhToan t WHERE t.ngayThanhToan BETWEEN :start AND :end")
    BigDecimal sumSoTienByNgayThanhToanBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // 7. Đếm số giao dịch thành công trong ngày
    long countByNgayThanhToanBetween(LocalDateTime start, LocalDateTime end);

    // 8. Thống kê doanh thu theo phương thức thanh toán (Để vẽ biểu đồ tròn - Pie Chart)
    @Query("SELECT t.phuongThuc, SUM(t.soTien) FROM ThanhToan t "
            + "WHERE t.ngayThanhToan BETWEEN :start AND :end "
            + "GROUP BY t.phuongThuc")
    List<Object[]> sumRevenueByPaymentMethod(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // 9. Stored Procedure chốt thanh toán (Giữ nguyên của ông giáo)
    @Procedure(procedureName = "SP_CHOT_THANH_TOAN_HOA_DON")
    String chotThanhToanHoaDon(
            @Param("p_mahd") String maHd,
            @Param("p_mans") String maNs,
            @Param("p_phuongthuc") String phuongThuc);
}
