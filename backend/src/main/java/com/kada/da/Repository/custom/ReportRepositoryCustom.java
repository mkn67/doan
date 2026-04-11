package com.kada.da.Repository.custom;

import com.kada.da.Dto.Response.CanhBaoHetHanDTO;
import com.kada.da.Dto.Response.DoanhThuResponseDTO;

import java.util.List;

public interface ReportRepositoryCustom {
    List<CanhBaoHetHanDTO> getCanhBaoHetHan(int soNgay);

    List<DoanhThuResponseDTO> getThongKeDoanhThuThang(int thang, int nam);
}