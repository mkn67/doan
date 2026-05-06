package com.kada.da.modules.report.domain;

import org.hibernate.annotations.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Immutable // KHÓA CỨNG: Đây là View, cấm Insert/Update/Delete
@Table(name = "V_RATING_BAC_SI")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VRatingBacSi {

    @Id // Buộc phải có, chọn MANS vì mỗi bác sĩ chỉ có 1 dòng tổng hợp
    @Column(name = "MANS")
    private String maNs;

    @Column(name = "HOTEN")
    private String hoTen;

    @Column(name = "CHUYENKHOA")
    private String chuyenKhoa;

    @Column(name = "TONG_LUOT_DANH_GIA")
    private Integer tongLuotDanhGia;

    @Column(name = "RATING_TRUNG_BINH")
    private Double ratingTrungBinh;
}