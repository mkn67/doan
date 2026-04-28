package com.kada.da.Service;

import com.kada.da.Entity.HoaDon;
import com.kada.da.Dto.HoaDonRequestDTO;
import com.kada.da.Dto.Response.HoaDonResponseDTO;

import java.util.Map;

public interface HoaDonService {

    HoaDon thanhToanHoaDon(HoaDon hoaDon);

    HoaDon findById(String maHd);

    Map<String, String> taoHoaDonTuJson(String maKh, String maNs, String maHoso, String maDon, String jsonSp,
            String jsonDv);

    void huyHoaDon(String maHd);

    HoaDonResponseDTO taoHoaDon(HoaDonRequestDTO request);
}