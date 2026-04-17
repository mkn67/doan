package com.kada.da.Service;

import com.kada.da.Entity.KhachHang;
import java.util.List;

public interface KhachHangService {
    List<KhachHang> layTatCaKhachHang();

    KhachHang timKhachHangTheoId(String maKh);

    KhachHang timKhachHangTheoSdt(String sdt);

    KhachHang taoMoiKhachHang(KhachHang khachHang);

    KhachHang capNhatKhachHang(String maKh, KhachHang khachHang);

    void xoaMemKhachHang(String maKh);

    void congDiemThuCong(String maKh, Integer soDiem, String lyDo, String maHd);

    String layLichSuKhamMoiNhat(String maKh);
}