package com.kada.da.Service.impl;

import com.kada.da.Entity.PhieuKeDon;
import com.kada.da.Repository.PhieuKeDonRepository;
import com.kada.da.Service.PhieuKeDonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PhieuKeDonServiceImpl implements PhieuKeDonService {

    private final PhieuKeDonRepository phieuKeDonRepository;

    @Override
    @Transactional
    public PhieuKeDon taoDonThuoc(PhieuKeDon phieuKeDon) {
        // Sinh mã tự động chuẩn form hệ thống (VD: PK001) thay vì UUID loằng ngoằng
        phieuKeDon.setMaDon(generateMaDon());

        // 👉 ĐÃ SỬA: Dùng đúng tên biến ngayKeDon
        phieuKeDon.setNgayKeDon(LocalDateTime.now());

        // 👉 ĐÃ SỬA: Dùng đúng tên biến getChiTietKeDons
        if (phieuKeDon.getChiTietKeDons() != null) {
            phieuKeDon.getChiTietKeDons().forEach(ct -> ct.setPhieuKeDon(phieuKeDon));
        }

        return phieuKeDonRepository.save(phieuKeDon);
    }

    @Override
    public List<PhieuKeDon> layDonThuocTheoHoSo(String maHoSo) {
        // 👉 ĐÃ SỬA: Tìm theo Hồ Sơ Thị Lực vì Entity không nối trực tiếp Khách Hàng
        return phieuKeDonRepository.findByHoSoThiLuc_MaHoSoOrderByNgayKeDonDesc(maHoSo);
    }

    // Hàm sinh mã tự động
    private String generateMaDon() {
        String maxCode = phieuKeDonRepository.findMaxMaDon();
        if (maxCode == null || maxCode.length() < 3) {
            return "PK001";
        }
        try {
            int nextNumber = Integer.parseInt(maxCode.substring(2)) + 1;
            return "PK" + String.format("%03d", nextNumber);
        } catch (NumberFormatException e) {
            return "PK001";
        }
    }
}