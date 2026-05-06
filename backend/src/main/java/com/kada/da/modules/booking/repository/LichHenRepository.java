package com.kada.da.modules.inventory.repository;

import com.kada.da.modules.booking.domain.LichHen;
import com.kada.da.modules.inventory.domain.SanPham;
import com.kada.da.Enum.TrangThaiLichHen;

import com.kada.da.modules.inventory.repository.custom.LichHenRepositoryCustom;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LichHenRepository extends JpaRepository<LichHen, String>, LichHenRepositoryCustom {

    List<LichHen> findByNhanSu_MaNsAndNgayHenOrderByGioHenAsc(String maBacSi, LocalDate ngayHen);

    List<LichHen> findByKhachHang_MaKhOrderByNgayHenDesc(String maKhachHang);

    // FIX TẠI ĐÂY: Đổi List<String> thành List<TrangThaiLichHen>
    boolean existsByKhachHang_MaKhAndTrangThaiIn(String maKhachHang, List<TrangThaiLichHen> trangThai);

    List<LichHen> findByTrangThaiNot(TrangThaiLichHen trangThai);

    // Tên trong attributePaths PHẢI GIỐNG HỆT tên biến List<LoHang> trong Entity
    // SanPham của ông
    @EntityGraph(attributePaths = { "danhSachLoHang" })
    @Query("SELECT sp FROM SanPham sp")
    List<SanPham> findAllKemLoHang();

    // Trở lại file Service, thay vì gọi findAll(), ông gọi findAllKemLoHang() là
    // xong!
    @EntityGraph(attributePaths = { "khachHang", "danhSachLichHenTrieuChung", "danhSachLichHenTrieuChung.trieuChung" })
    @Query("SELECT lh FROM LichHen lh")
    List<LichHen> findAllKemTrieuChung();
}