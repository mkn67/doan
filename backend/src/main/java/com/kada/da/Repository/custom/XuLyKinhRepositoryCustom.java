package com.kada.da.Repository.custom;

public interface XuLyKinhRepositoryCustom {
    // Trả về String chính là cái Mã Xử Lý (p_maxl_out)
    String giaoXuLyKinh(String maDon, String maNsKyThuat, String thongSoKinh);
}