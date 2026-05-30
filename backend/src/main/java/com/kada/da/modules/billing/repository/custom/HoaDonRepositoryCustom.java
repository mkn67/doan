package com.kada.da.modules.billing.repository.custom;

import java.util.Map;

public interface HoaDonRepositoryCustom {
    Map<String, String> taoHoaDonTuJson(String maKh, String maNs, String maHoso, String maDon, String jsonSp,
            String jsonDv, String loaiKeDon);

    void huyHoaDon(String maHd);
}