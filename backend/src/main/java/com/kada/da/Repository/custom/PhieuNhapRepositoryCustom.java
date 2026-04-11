package com.kada.da.Repository.custom;

import java.util.Map;

public interface PhieuNhapRepositoryCustom {
    Map<String, Object> nhapKhoLoHang(
            String maPn, String maNcc, String maNs, String maLo, String maSp,
            java.time.LocalDate ngaySx, java.time.LocalDate ngayHetHan,
            Integer soLuongNhap, Double giaNhap);
}