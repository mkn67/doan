package com.kada.da.Service;

import com.kada.da.Entity.ThanhToan;
import java.util.List;

public interface ThanhToanService {
    ThanhToan createThanhToan(ThanhToan thanhToan);

    ThanhToan getThanhToanById(String maTt);

    List<ThanhToan> getAllThanhToan();

    List<ThanhToan> getThanhToanByMaHd(String maHd);

    List<ThanhToan> getThanhToanByMaNs(String maNs);

    String chotThanhToan(String maHd, String maNs, String phuongThuc);
}