package com.kada.da.Dto;

import lombok.Data;

@Data
public class LichHenFilterDTO {
    private String keyword; // Tìm theo Tên hoặc SĐT khách hàng

    private String maNs; // Lọc xem bác sĩ A hôm nay có mấy lịch

    // Lọc theo khoảng thời gian (Mặc định thường là ngày hôm nay)
    private String tuNgay; // Định dạng yyyy-MM-dd
    private String denNgay; // Định dạng yyyy-MM-dd

    private String trangThai; // CHUA_XAC_NHAN, DA_XAC_NHAN, DA_DEN, DA_HUY

    // Phân trang chuẩn form
    private int page = 0;
    private int size = 10;
    private String sortBy = "ngayHen"; // Sắp xếp theo ngày hẹn
    private String sortDir = "asc"; // Ai hẹn sớm thì xếp lên đầu
}