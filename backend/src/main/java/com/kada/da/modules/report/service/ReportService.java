package com.kada.da.modules.report.service;

import java.util.List;

import com.kada.da.modules.inventory.dto.CanhBaoHetHanDTO;
import com.kada.da.modules.report.dto.DoanhThuResponseDTO;
import com.kada.da.modules.report.dto.ThongKeTongQuanDTO;

public interface ReportService {
    List<CanhBaoHetHanDTO> canhBaoHangHetHan(int soNgay);

    List<DoanhThuResponseDTO> thongKeDoanhThuThang(int thang, int nam);

    List<DoanhThuResponseDTO> thongKeDoanhThuNgay(java.time.LocalDate tuNgay, java.time.LocalDate denNgay);

    ThongKeTongQuanDTO layThongKeTongQuan();
}