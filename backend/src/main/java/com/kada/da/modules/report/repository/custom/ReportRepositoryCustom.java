package com.kada.da.modules.billing.repository.custom;

import com.kada.da.modules.inventory.dto.CanhBaoHetHanDTO;
import com.kada.da.Dto.Response.DoanhThuResponseDTO;

import java.util.List;

public interface ReportRepositoryCustom {
    List<CanhBaoHetHanDTO> getCanhBaoHetHan(int soNgay);

    List<DoanhThuResponseDTO> getThongKeDoanhThuThang(int thang, int nam);
}