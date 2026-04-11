package com.kada.da.Repository;

import com.kada.da.Entity.HoaDon;
import com.kada.da.Repository.custom.HoaDonRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;
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

    // Tìm hóa đơn theo mã đơn thuốc (PhieuKeDon)
    List<HoaDon> findByPhieuKeDon_MaDon(String maDon);
}