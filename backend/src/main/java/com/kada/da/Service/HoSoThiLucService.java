package com.kada.da.Service;

import com.kada.da.Entity.HoSoThiLuc;
import java.util.List;

public interface HoSoThiLucService {
    // Bác sĩ lưu kết quả đo mắt
    HoSoThiLuc taoHoSoKham(HoSoThiLuc hoSoThiLuc, String maLichHen);

    // Lấy lịch sử khám của bệnh nhân
    List<HoSoThiLuc> layLichSuKham(String maKhachHang);

    // Lấy chi tiết 1 hồ sơ cụ thể
    HoSoThiLuc xemChiTietHoSo(String maHoSo);
}