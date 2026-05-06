package com.kada.da.modules.report.repository.custom;

import com.kada.da.modules.inventory.dto.CanhBaoHetHanDTO;
import com.kada.da.modules.report.dto.DoanhThuResponseDTO;

import java.util.List;

public interface ReportRepositoryCustom {
    List<CanhBaoHetHanDTO> getCanhBaoHetHan(int soNgay);

    List<DoanhThuResponseDTO> getThongKeDoanhThuThang(int thang, int nam);
}