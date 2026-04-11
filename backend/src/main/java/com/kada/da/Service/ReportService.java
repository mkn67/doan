package com.kada.da.Service;

import com.kada.da.Dto.Response.CanhBaoHetHanDTO;
import com.kada.da.Dto.Response.DoanhThuResponseDTO;

import java.util.List;

public interface ReportService {
    List<CanhBaoHetHanDTO> canhBaoHangHetHan(int soNgay);

    List<DoanhThuResponseDTO> thongKeDoanhThuThang(int thang, int nam);
}