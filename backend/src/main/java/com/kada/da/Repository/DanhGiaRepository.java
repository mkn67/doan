package com.kada.da.Repository;

import com.kada.da.Entity.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DanhGiaRepository extends JpaRepository<DanhGia, String> {

    // 1. Tìm đánh giá theo mã hồ sơ (Mỗi hồ sơ thường chỉ có 1 đánh giá)
    Optional<DanhGia> findByHoSoThiLuc_MaHoSo(String maHoSo);

    // 2. Tìm tất cả đánh giá do một khách hàng viết
    List<DanhGia> findByKhachHang_MaKh(String maKh);

    // 3. Tìm tất cả đánh giá dành cho một bác sĩ/nhân sự cụ thể
    List<DanhGia> findByNhanSu_MaNs(String maNs);

    // 4. Lọc đánh giá theo số sao (Ví dụ: Lấy toàn bộ đánh giá 5 sao)
    List<DanhGia> findBySoSao(Integer soSao);

    // 5. Lấy các đánh giá được phép hiển thị (Không bị ẩn bởi Admin)
    @Query("SELECT d FROM DanhGia d WHERE d.isHidden = 0")
    List<DanhGia> findByIsHiddenFalse();

    // 6. Tìm các đánh giá mới nhất từ một mốc thời gian (Ví dụ: 7 ngày qua)
    List<DanhGia> findByNgayDgAfter(LocalDateTime ngay);

    // 7. Cực kỳ quan trọng: Tính điểm trung bình của một bác sĩ bằng SQL
    @Query("SELECT AVG(d.soSao) FROM DanhGia d WHERE d.nhanSu.maNs = :maNs")
    Double getAverageRatingByNhanSu(@Param("maNs") String maNs);

    // 8. Đếm số lượng đánh giá theo từng mức sao (Dùng để tính tỷ lệ %)
    long countBySoSao(Integer soSao);
}