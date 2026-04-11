package com.kada.da.Repository;

import com.kada.da.Entity.XuLyKinh;
import com.kada.da.Repository.custom.XuLyKinhRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface XuLyKinhRepository extends JpaRepository<XuLyKinh, String>, XuLyKinhRepositoryCustom {

    // Lấy mã lớn nhất để sinh XL001, XL002 tự động
    @Query("SELECT MAX(x.maXl) FROM XuLyKinh x")
    String findMaxMaXl();

    // Tìm theo mã đơn thuốc
    List<XuLyKinh> findByPhieuKeDon_MaDon(String maDon);

    // Tìm theo trạng thái (Ví dụ: "Chờ xử lý", "Hoàn thành")
    List<XuLyKinh> findByTrangThai(String trangThai);

    // Tìm các kính đang được xử lý bởi 1 kỹ thuật viên cụ thể
    List<XuLyKinh> findByNhanSuKyThuat_MaNsAndTrangThai(String maKyThuat, String trangThai);
}