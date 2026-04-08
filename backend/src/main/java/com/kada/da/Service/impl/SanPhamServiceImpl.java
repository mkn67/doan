package com.kada.da.Service.impl;

import com.kada.da.Entity.SanPham;
import com.kada.da.Repository.SanPhamRepository;
import com.kada.da.Service.SanPhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SanPhamServiceImpl implements SanPhamService {

        private final SanPhamRepository sanPhamRepository;

        @Override
        @Transactional
        public SanPham createSanPham(SanPham sanPham) {
                // Tự động sinh mã SP001
                sanPham.setMaSp(generateMaSp());
                return sanPhamRepository.save(sanPham);
        }

        @Override
        @Transactional
        public SanPham updateSanPham(String maSp, SanPham sanPham) {
                SanPham existing = sanPhamRepository.findById(maSp)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy Sản phẩm với mã: " + maSp));

                existing.setLoaiSanPham(sanPham.getLoaiSanPham());
                existing.setTenSp(sanPham.getTenSp());
                existing.setDonViTinh(sanPham.getDonViTinh());
                existing.setLaThuoc(sanPham.getLaThuoc());
                existing.setGiaBan(sanPham.getGiaBan());
                existing.setTonKhoToiThieu(sanPham.getTonKhoToiThieu());
                existing.setDonViTinhKho(sanPham.getDonViTinhKho());

                return sanPhamRepository.save(existing);
        }

        @Override
        @Transactional
        public void deleteSanPham(String maSp) {
                SanPham existing = sanPhamRepository.findById(maSp)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy Sản phẩm với mã: " + maSp));
                sanPhamRepository.delete(existing);
        }

        @Override
        public SanPham getSanPhamById(String maSp) {
                return sanPhamRepository.findById(maSp)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy Sản phẩm với mã: " + maSp));
        }

        @Override
        public List<SanPham> getAllSanPham() {
                return sanPhamRepository.findAll();
        }

        @Override
        public List<SanPham> getDanhSachThuoc() {
                return sanPhamRepository.findByLaThuoc(1); // 1 là thuốc
        }

        // ==================== HÀM PRIVATE ====================
        private String generateMaSp() {
                String maxCode = sanPhamRepository.findMaxMaSp();
                if (maxCode == null || maxCode.length() < 3) {
                        return "SP001";
                }
                try {
                        int nextNumber = Integer.parseInt(maxCode.substring(2)) + 1;
                        return "SP" + String.format("%03d", nextNumber);
                } catch (NumberFormatException e) {
                        return "SP001";
                }
        }
}