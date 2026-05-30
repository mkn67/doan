package com.kada.da.modules.billing.service;

import java.time.LocalDateTime;
import java.util.List;

import com.kada.da.modules.billing.domain.ThanhToan;
import com.kada.da.modules.billing.dto.ThanhToanRequestDTO;
import com.kada.da.modules.billing.dto.ThanhToanResponseDTO;

public interface ThanhToanService {

    ThanhToan createThanhToan(ThanhToan thanhToan);

    ThanhToan getThanhToanById(String maTt);

    List<ThanhToan> getAllThanhToan();

    List<ThanhToan> getThanhToanByMaHd(String maHd);

    List<ThanhToan> getThanhToanByMaNs(String maNs, LocalDateTime start, LocalDateTime end);

    String chotThanhToan(String maHd, String maNs, String phuongThuc);

    ThanhToanResponseDTO xuLyThanhToan(ThanhToanRequestDTO request);
}
