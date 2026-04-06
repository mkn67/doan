package com.kada.da.Repository;

import com.kada.da.Entity.LoHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LoHangRepository extends JpaRepository<LoHang, String> {

    // 1. Tìm các lô hàng có số lượng tồn dưới mức cảnh báo (VD: dưới 10 cái)
    List<LoHang> findBySoLuongTonLessThanEqual(Integer soLuongToiThieu);

    @Query("SELECT l FROM LoHang l WHERE l.ngayHetHan <= :ngayCanhBao AND l.soLuongTon > 0")
    List<LoHang> canhBaoHetHan(@Param("ngayCanhBao") LocalDate ngayCanhBao);
}