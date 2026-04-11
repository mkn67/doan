package com.kada.da.Repository.custom;

import java.util.Map;

public interface HoaDonRepositoryCustom {
    Map<String, String> taoHoaDonTuJson(String maKh, String maNs, String maHoso, String maDon, String jsonSp,
            String jsonDv);

    void huyHoaDon(String maHd);
}