package com.kada.da.modules.report.service;

import com.kada.da.modules.inventory.dto.CanhBaoHetHanDTO;
import com.kada.da.modules.report.dto.DoanhThuResponseDTO;
import com.kada.da.modules.report.dto.ThongKeTongQuanDTO;
import com.kada.da.modules.report.repository.custom.ReportRepositoryCustom;
import com.kada.da.modules.customer.repository.KhachHangRepository;
import com.kada.da.modules.billing.repository.HoaDonRepository;
import com.kada.da.modules.prescription.repository.PhieuKeDonRepository;
import com.kada.da.modules.billing.repository.ThanhToanRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportRepositoryCustom reportRepository;
    private final KhachHangRepository khachHangRepository;
    private final HoaDonRepository hoaDonRepository;
    private final PhieuKeDonRepository phieuKeDonRepository;
    private final ThanhToanRepository thanhToanRepository;

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
    public List<DoanhThuResponseDTO> thongKeDoanhThuNgay(LocalDate tuNgay, LocalDate denNgay) {
        log.info("Gọi SP_THONG_KE_DOANH_THU_THEO_NGAY: từ ngày={}, đến ngày={}", tuNgay, denNgay);
        return reportRepository.getThongKeDoanhThuNgay(tuNgay, denNgay);
    }

    @Override
    @Transactional(readOnly = true)
    public ThongKeTongQuanDTO layThongKeTongQuan() {
        log.info("Lấy thống kê tổng quan cho dashboard");
        long tongSoBenhNhan = khachHangRepository.count();
        long tongSoHoaDon = hoaDonRepository.countActiveHoaDon();
        long tongSoDonThuoc = phieuKeDonRepository.count();
        
        java.math.BigDecimal tongDoanhThu = thanhToanRepository.sumTotalRevenue();
        if (tongDoanhThu == null) {
            tongDoanhThu = java.math.BigDecimal.ZERO;
        }

        // Tỷ lệ tăng trưởng doanh thu so với tháng trước
        LocalDate now = LocalDate.now();
        java.time.LocalDateTime startThisMonth = now.withDayOfMonth(1).atStartOfDay();
        java.time.LocalDateTime endThisMonth = now.atTime(23, 59, 59);
        
        java.time.LocalDateTime startLastMonth = now.minusMonths(1).withDayOfMonth(1).atStartOfDay();
        java.time.LocalDateTime endLastMonth = now.minusMonths(1).withDayOfMonth(now.minusMonths(1).lengthOfMonth()).atTime(23, 59, 59);

        java.math.BigDecimal revThisMonth = thanhToanRepository.sumSoTienByNgayThanhToanBetween(startThisMonth, endThisMonth);
        java.math.BigDecimal revLastMonth = thanhToanRepository.sumSoTienByNgayThanhToanBetween(startLastMonth, endLastMonth);

        if (revThisMonth == null) revThisMonth = java.math.BigDecimal.ZERO;
        if (revLastMonth == null) revLastMonth = java.math.BigDecimal.ZERO;

        double tyLeTangTruong = 0.0;
        if (revLastMonth.compareTo(java.math.BigDecimal.ZERO) > 0) {
            tyLeTangTruong = revThisMonth.subtract(revLastMonth)
                    .divide(revLastMonth, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new java.math.BigDecimal(100))
                    .doubleValue();
        }

        return ThongKeTongQuanDTO.builder()
                .tongSoBenhNhan((int) tongSoBenhNhan)
                .tongSoHoaDon((int) tongSoHoaDon)
                .tongSoDonThuoc((int) tongSoDonThuoc)
                .tongDoanhThu(tongDoanhThu)
                .tyLeTangTruongDoanhThu(tyLeTangTruong)
                .build();
    }
}