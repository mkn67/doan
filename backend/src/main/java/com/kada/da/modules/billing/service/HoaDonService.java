package com.kada.da.modules.billing.service;

import java.util.List;
import java.util.Map;

import com.kada.da.modules.billing.domain.HoaDon;
import com.kada.da.modules.billing.dto.HoaDonRequestDTO;
import com.kada.da.modules.billing.dto.HoaDonResponseDTO;

public interface HoaDonService {

    HoaDon thanhToanHoaDon(HoaDon hoaDon);

    HoaDon findById(String maHd);

    Map<String, String> taoHoaDonTuJson(String maKh, String maNs, String maHoso, String maDon, String jsonSp,
            String jsonDv);

    void huyHoaDon(String maHd);

    HoaDonResponseDTO taoHoaDon(HoaDonRequestDTO request);

    List<HoaDon> getAllHoaDon();
}
