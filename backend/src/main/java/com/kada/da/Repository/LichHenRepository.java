package com.kada.da.Repository;

import com.kada.da.Entity.LichHen;
import com.kada.da.Enum.TrangThaiLichHen;
import com.kada.da.Repository.custom.LichHenRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LichHenRepository extends JpaRepository<LichHen, String>, LichHenRepositoryCustom {

    List<LichHen> findByNhanSu_MaNsAndNgayHenOrderByGioHenAsc(String maBacSi, LocalDate ngayHen);

    List<LichHen> findByKhachHang_MaKhOrderByNgayHenDesc(String maKhachHang);

    // FIX TẠI ĐÂY: Đổi List<String> thành List<TrangThaiLichHen>
    boolean existsByKhachHang_MaKhAndTrangThaiIn(String maKhachHang, List<TrangThaiLichHen> trangThai);
}