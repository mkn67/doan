package com.kada.da.Repository;

import com.kada.da.Entity.LichHen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository

public interface LichHenRepository extends JpaRepository<LichHen, String> {
    List<LichHen> findByNhanSu_MaNsAndNgayHenOrderByGioHenAsc(String maBacSi, LocalDate ngayHen);

    List<LichHen> findByKhachHang_MaKhOrderByNgayHenDesc(String maKhachHang);

    boolean existsByKhachHang_MaKhAndTrangThaiIn(String maKhachHang, List<String> trangThai);

}
