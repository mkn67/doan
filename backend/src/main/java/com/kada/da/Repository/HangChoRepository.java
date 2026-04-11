package com.kada.da.Repository;

import com.kada.da.Entity.HangCho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
}