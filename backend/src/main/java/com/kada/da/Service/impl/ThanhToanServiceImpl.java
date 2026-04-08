package com.kada.da.Service.impl;

import com.kada.da.Entity.ThanhToan;
import com.kada.da.Repository.ThanhToanRepository;
import com.kada.da.Service.ThanhToanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ThanhToanServiceImpl implements ThanhToanService {

    private final ThanhToanRepository thanhToanRepository;

    @Override
    @Transactional
    public ThanhToan createThanhToan(ThanhToan thanhToan) {
        // Sinh mã TT001 tự động
        thanhToan.setMaTt(generateMaTt());

        // Nếu client không gửi ngày thì tự động lấy giờ hiện tại
        if (thanhToan.getNgayThanhToan() == null) {
            thanhToan.setNgayThanhToan(LocalDateTime.now());
        }

        // Mặc định trạng thái
        if (thanhToan.getTrangThai() == null || thanhToan.getTrangThai().isEmpty()) {
            thanhToan.setTrangThai("Hoàn thành");
        }

        return thanhToanRepository.save(thanhToan);
    }

    @Override
    public ThanhToan getThanhToanById(String maTt) {
        return thanhToanRepository.findById(maTt)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch thanh toán: " + maTt));
    }

    @Override
    public List<ThanhToan> getAllThanhToan() {
        return thanhToanRepository.findAll();
    }

    @Override
    public List<ThanhToan> getThanhToanByMaHd(String maHd) {
        return thanhToanRepository.findByHoaDon_MaHd(maHd);
    }

    @Override
    public List<ThanhToan> getThanhToanByMaNs(String maNs) {
        return thanhToanRepository.findByNhanSu_MaNsOrderByNgayThanhToanDesc(maNs);
    }

    // Hàm tự sinh mã TT
    private String generateMaTt() {
        String maxCode = thanhToanRepository.findMaxMaTt();
        if (maxCode == null || maxCode.length() < 3) {
            return "TT001";
        }
        try {
            int nextNumber = Integer.parseInt(maxCode.substring(2)) + 1;
            return "TT" + String.format("%03d", nextNumber);
        } catch (NumberFormatException e) {
            return "TT001";
        }
    }
}