package com.kada.da.Service.impl;

import com.kada.da.Entity.PhieuKeDon;
import com.kada.da.Repository.PhieuKeDonRepository;
import com.kada.da.Service.PhieuKeDonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PhieuKeDonServiceImpl implements PhieuKeDonService {

    private final PhieuKeDonRepository phieuKeDonRepository;

    @Override
    @Transactional
    public PhieuKeDon taoDonThuoc(PhieuKeDon phieuKeDon) {
        // Sinh mã đơn thuốc tự động
        phieuKeDon.setMaDon("DT" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        phieuKeDon.setNgayKe(LocalDateTime.now());

        // Nếu có chi tiết đơn thuốc, nhớ set ngược lại khóa ngoại
        if (phieuKeDon.getChiTietDonThuocs() != null) {
            phieuKeDon.getChiTietDonThuocs().forEach(ct -> ct.setPhieuKeDon(phieuKeDon));
        }

        return phieuKeDonRepository.save(phieuKeDon);
    }

    @Override
    public List<PhieuKeDon> layDonThuocTheoKhachHang(String maKh) {
        return phieuKeDonRepository.findByKhachHang_MaKhOrderByNgayKeDesc(maKh);
    }
}