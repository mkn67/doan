package com.kada.da.modules.report.repository.custom;

import java.util.List;

import com.kada.da.modules.inventory.dto.CanhBaoHetHanDTO;
import com.kada.da.modules.report.dto.DoanhThuResponseDTO;

public interface ReportRepositoryCustom {
    List<CanhBaoHetHanDTO> getCanhBaoHetHan(int soNgay);

    List<DoanhThuResponseDTO> getThongKeDoanhThuThang(int thang, int nam);

    List<DoanhThuResponseDTO> getThongKeDoanhThuNgay(java.time.LocalDate tuNgay, java.time.LocalDate denNgay);
}