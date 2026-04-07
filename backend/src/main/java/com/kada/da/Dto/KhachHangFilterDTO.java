package com.kada.da.Dto;

import lombok.Data;

@Data
public class KhachHangFilterDTO {
    private String keyword; // Tìm theo cả tên, sdt hoặc email
    private String diaChi;

    // Tìm kiếm khách hàng theo khoảng thời gian tham gia
    private String tuNgay;
    private String denNgay;

    // Lọc khách hàng thân thiết
    private Integer soLanKhamToiThieu;

    // Phân trang (Cái này cô giáo soi kỹ lắm nè)
    private int page = 0;
    private int size = 10;
    private String sortBy = "maKh";
    private String sortDir = "asc";
}