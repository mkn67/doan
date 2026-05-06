package com.kada.da.modules.billing.service;

import com.kada.da.modules.billing.domain.HoaDon;
import com.kada.da.modules.billing.dto.HoaDonRequestDTO;
import com.kada.da.modules.billing.dto.HoaDonResponseDTO;

import java.util.Map;

public interface HoaDonService {

    HoaDon thanhToanHoaDon(HoaDon hoaDon);

    HoaDon findById(String maHd);

    Map<String, String> taoHoaDonTuJson(String maKh, String maNs, String maHoso, String maDon, String jsonSp,
            String jsonDv);

    void huyHoaDon(String maHd);

    HoaDonResponseDTO taoHoaDon(HoaDonRequestDTO request);
}