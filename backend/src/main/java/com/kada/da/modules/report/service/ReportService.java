package com.kada.da.modules.report.service;

import com.kada.da.modules.inventory.dto.CanhBaoHetHanDTO;
import com.kada.da.modules.report.dto.DoanhThuResponseDTO;

import java.util.List;

public interface ReportService {
    List<CanhBaoHetHanDTO> canhBaoHangHetHan(int soNgay);

    List<DoanhThuResponseDTO> thongKeDoanhThuThang(int thang, int nam);
}