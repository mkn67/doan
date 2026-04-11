package com.kada.da.Service.impl;

import com.kada.da.Dto.Response.CanhBaoHetHanDTO;
import com.kada.da.Dto.Response.DoanhThuResponseDTO;
import com.kada.da.Repository.custom.ReportRepositoryCustom;
import com.kada.da.Service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportRepositoryCustom reportRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CanhBaoHetHanDTO> canhBaoHangHetHan(int soNgay) {
        log.info("Gọi SP_CANH_BAO_HANG_HET_HAN với số ngày: {}", soNgay);
        List<CanhBaoHetHanDTO> result = reportRepository.getCanhBaoHetHan(soNgay);
        log.info("Tìm thấy {} lô hàng sắp hết hạn trong {} ngày tới", result.size(), soNgay);
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoanhThuResponseDTO> thongKeDoanhThuThang(int thang, int nam) {
        log.info("Gọi SP_THONG_KE_DOANH_THU_THANG: tháng={}, năm={}", thang, nam);
        return reportRepository.getThongKeDoanhThuThang(thang, nam);
    }
}