package com.kada.da.Service;

import com.kada.da.Entity.HoSoThiLuc;
import java.util.List;
import java.util.Map;

public interface HoSoThiLucService {
    // Bác sĩ lưu kết quả đo mắt
    HoSoThiLuc taoHoSoKham(HoSoThiLuc hoSoThiLuc, String maLichHen);

    // Lấy lịch sử khám của bệnh nhân
    List<HoSoThiLuc> layLichSuKham(String maKhachHang);

    // Lấy chi tiết 1 hồ sơ cụ thể
    HoSoThiLuc xemChiTietHoSo(String maHoSo);

    Map<String, String> taoHoSoKhamBangSP(
            String maKhachHang,
            String maBacSi,
            String ketLuan,
            Double matTraiSph, Double matTraiCyl, Integer matTraiAx, Double docongTrai,
            Double matPhaiSph, Double matPhaiCyl, Integer matPhaiAx, Double docongPhai,
            Double pd);
}