package com.kada.da.Repository;

import com.kada.da.Entity.HoaDon;
import com.kada.da.Entity.NhanSu;
import com.kada.da.Entity.XuLyKinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface XuLyKinhRepository extends JpaRepository<XuLyKinh, String> {

    List<XuLyKinh> findByTinhTrang(String tinhTrang);

    List<XuLyKinh> findByTinhTrangIn(List<String> tinhTrangList);

    List<XuLyKinh> findByNhanSuKyThuatAndTinhTrang(NhanSu kyThuat, String tinhTrang);

    @Query("SELECT MAX(x.maXlk) FROM XuLyKinh x")
    String findMaxMaXlk();

    List<XuLyKinh> findByHoaDon(HoaDon hoaDon);
}