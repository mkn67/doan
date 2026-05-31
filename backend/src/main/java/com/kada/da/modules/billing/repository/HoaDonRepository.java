package com.kada.da.modules.billing.repository;

import com.kada.da.modules.billing.domain.HoaDon;
import com.kada.da.modules.billing.repository.custom.HoaDonRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HoaDonRepository
        extends JpaRepository<HoaDon, String>,
        HoaDonRepositoryCustom {
    // Lấy danh sách hóa đơn của khách hàng
    List<HoaDon> findByKhachHang_MaKhOrderByNgayLapDesc(String maKh);

    // Tìm hóa đơn theo trạng thái (Chưa thanh toán, Đã thanh toán)
    List<HoaDon> findByTrangThai(String trangThai);

    boolean existsByKhachHang_MaKhAndTrangThai(String maKh, com.kada.da.modules.billing.Enum.TrangThaiHoaDon trangThai);

    // Tìm hóa đơn theo mã đơn thuốc (PhieuKeDon)
    List<HoaDon> findByPhieuKeDon_MaDon(String maDon);

    // Thống kê số lượng hóa đơn chưa bị xóa
    @Query("SELECT COUNT(h) FROM HoaDon h WHERE h.isDeleted IS NULL OR h.isDeleted = 0")
    long countActiveHoaDon();
}
