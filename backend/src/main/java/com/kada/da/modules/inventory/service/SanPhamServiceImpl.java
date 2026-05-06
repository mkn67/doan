package com.kada.da.modules.inventory.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kada.da.modules.inventory.domain.SanPham;
import com.kada.da.modules.inventory.dto.CanhBaoTonKhoDto;
import com.kada.da.modules.inventory.repository.SanPhamRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
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
    @Transactional(readOnly = true)
    public SanPham getSanPhamById(String maSp) {
        return sanPhamRepository.findById(maSp)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Sản phẩm với mã: " + maSp));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SanPham> getAllSanPham() {
        return sanPhamRepository.findAll();
    }

    @Override
    public List<SanPham> getDanhSachThuoc() {
        return sanPhamRepository.findByLaThuoc(1); // 1 là thuốc
    }

    // ==================== HÀM PRIVATE ====================
    private synchronized String generateMaSp() {
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

    @Override
    public List<CanhBaoTonKhoDto> getCanhBaoTonKho() {
        List<SanPham> danhSachSp = sanPhamRepository.findAll();
        LocalDate today = LocalDate.now();

        return danhSachSp.stream().map(sp -> {
            // Cộng dồn tồn kho của các lô hàng chưa hết hạn và còn hàng
            long tongTon = sp.getDanhSachLoHang().stream()
                    .filter(lh -> lh.getNgayHetHan() != null && lh.getNgayHetHan().isAfter(today)
                    && lh.getSoLuongTon() != null && lh.getSoLuongTon() > 0)
                    .mapToLong(lh -> lh.getSoLuongTon() != null ? lh.getSoLuongTon() : 0L)
                    .sum();

            int toiThieu = sp.getTonKhoToiThieu() != null ? sp.getTonKhoToiThieu() : 0;
            String mucDo = "On dinh";

            if (tongTon == 0) {
                mucDo = "Het hang";
            } else if (tongTon <= toiThieu) {
                mucDo = "Sap het";
            } else if (tongTon <= toiThieu * 2) {
                mucDo = "Canh bao";
            }

            return CanhBaoTonKhoDto.builder()
                    .maSp(sp.getMaSp()).tenSp(sp.getTenSp()).donViTinh(sp.getDonViTinh())
                    .tongTon(tongTon).tonKhoToiThieu(toiThieu).mucDo(mucDo)
                    .build();
        })
                // Lọc bỏ những thằng "On dinh", chỉ lấy hàng cần cảnh báo giống mệnh đề HAVING
                // trong SQL
                .filter(dto -> !dto.getMucDo().equals("On dinh"))
                .collect(Collectors.toList());
    }
}
