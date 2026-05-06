package com.kada.da.modules.inventory.repository;

import com.kada.da.modules.booking.domain.HangCho;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HangChoRepository extends JpaRepository<HangCho, String> {

    // =========================================================
    // GỌI SP 8: CẬP NHẬT HÀNG CHỜ
    // =========================================================
    @Procedure(procedureName = "SP_CAP_NHAT_HANG_CHO")
    void capNhatHangCho(
            @Param("p_mahc") String maHc,
            @Param("p_trang_thai") String trangThai,
            @Param("p_gio_vao_kham") java.sql.Timestamp gioVaoKham);

    // =========================================================
    // LẤY DANH SÁCH HÀNG CHỜ TRONG NGÀY HÔM NAY
    // =========================================================
    @EntityGraph(attributePaths = { "khachHang", "nhanSuPhanCong", "lichHen", "lichHen.goiKham" })
    // SỬA DÒNG NÀY: Dùng CAST để ép Timestamp về Date, so sánh với ngày hiện tại
    @Query("SELECT hc FROM HangCho hc WHERE CAST(hc.gioDangKy AS date) = CURRENT_DATE")
    List<HangCho> findHangChoToday();
}