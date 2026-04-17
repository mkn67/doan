package com.kada.da.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.kada.da.Entity.LoHang;
import com.kada.da.Entity.SanPham;

@Repository
public interface LoHangRepository extends JpaRepository<LoHang, String> {

    // Lấy danh sách lô hàng theo một sản phẩm cụ thể
    List<LoHang> findBySanPham(SanPham sanPham);

    // Tìm các lô hàng thuộc về một phiếu nhập
    // Chú ý: Dùng dấu _ để Spring phân biệt thuộc tính lồng nhau
    List<LoHang> findByPhieuNhap_MaPn(String maPn);

    // Tìm các lô hàng còn tồn kho (soLuongTon > 0)
    List<LoHang> findBySoLuongTonGreaterThan(Integer soLuong);

    // Tìm các lô hàng sắp hết hạn (nằm trong khoảng từ hôm nay đến X ngày tới) VÀ
    // còn tồn kho
    List<LoHang> findByNgayHetHanBetweenAndSoLuongTonGreaterThan(LocalDate startDate, LocalDate endDate,
            Integer soLuong);

    // Gọi Function Oracle lấy Lô hàng FEFO
    @Query("SELECT l FROM LoHang l WHERE l.sanPham.maSp = :maSp AND l.soLuongTon > 0 AND l.ngayHetHan >= CURRENT_DATE ORDER BY l.ngayHetHan ASC")
    List<LoHang> getDanhSachLoFefo(@Param("maSp") String maSp);
}