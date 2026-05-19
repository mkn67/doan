package com.kada.da.modules.report.service;

import com.kada.da.modules.inventory.dto.CanhBaoHetHanDTO;
import com.kada.da.modules.report.dto.DoanhThuResponseDTO;
import com.kada.da.modules.report.repository.custom.ReportRepositoryCustom;
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

    @Override
    @Transactional(readOnly = true)
    public List<DoanhThuResponseDTO> thongKeDoanhThuNgay(int tuNgay, int denNgay) {
        log.info("Gọi SP_THONG_KE_DOANH_THU_NGAY: từ ngày={}, đến ngày={}", tuNgay, denNgay);
        return reportRepository.getThongKeDoanhThuNgay(tuNgay, denNgay);
    }
}