package com.kada.da.Repository;

import com.kada.da.Entity.LichLamViec;
import com.kada.da.Entity.NhanSu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LichLamViecRepository extends JpaRepository<LichLamViec, String> {

    // =========================================================
    // 1. GỌI STORED PROCEDURE (SP 7: Tạo lịch làm việc)
    // =========================================================
    @Procedure(procedureName = "SP_TAO_LICH_LAM_VIEC")
    void taoLichLamViec(
            @Param("p_mans") String maNs,
            @Param("p_ngay_lam") LocalDate ngayLam,
            @Param("p_gio_bat_dau") Double gioBatDau,
            @Param("p_gio_ket_thuc") Double gioKetThuc,
            @Param("p_is_nghi") Integer isNghi);

    // =========================================================
    // 2. CÁC QUERY MẶC ĐỊNH CỦA JPA (Dùng để hiển thị dữ liệu)
    // =========================================================
    boolean existsByNhanSuAndNgayLamAndGioBatDau(NhanSu nhanSu, LocalDate ngayLam, Double gioBatDau);

    List<LichLamViec> findByNhanSuOrderByNgayLamAsc(NhanSu nhanSu);

    List<LichLamViec> findByNhanSuAndNgayLamBetween(NhanSu nhanSu, LocalDate fromDate, LocalDate toDate);

    List<LichLamViec> findByNgayLam(LocalDate ngayLam);

    List<LichLamViec> findByGioBatDauAndGioKetThuc(Double gioBatDau, Double gioKetThuc);

    /*
     * * ⚠️ LỜI KHUYÊN TỪ KIẾN TRÚC SƯ:
     * Tớ đã XÓA hàm `findMaxMaLlv()` đi vì nó là một Anti-Pattern (Lỗi thiết kế).
     * * Lý do: Dưới Database Oracle ông đã có SEQUENCE và TRIGGER để tự động
     * sinh mã (như LLV0001) rồi. Việc select MAX(ID) trên Backend nếu có
     * 2 người cùng click tạo lịch 1 lúc sẽ bị trùng mã gây lỗi hệ thống.
     * Hãy để Database tự lo việc sinh ID nhé!
     */
}