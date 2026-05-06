package com.kada.da.Repository;

import com.kada.da.Entity.KhachHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, String> {

    @Query("SELECT MAX(k.maKh) FROM KhachHang k")
    String findMaxMaKh();

    @Procedure(procedureName = "SP_CONG_DIEM")
    void congDiemThuCong(
            @Param("p_makh") String maKh,
            @Param("p_so_diem") Integer soDiem,
            @Param("p_ly_do") String lyDo,
            @Param("p_mahd") String maHd);

    @Query(value = "SELECT FN_LAY_LICH_SU_KHAM_CUOI(:p_makh) FROM DUAL", nativeQuery = true)
    String getLichSuKhamCuoi(@Param("p_makh") String maKh);
}