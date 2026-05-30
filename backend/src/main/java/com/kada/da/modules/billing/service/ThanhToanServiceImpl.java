package com.kada.da.modules.billing.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kada.da.modules.billing.domain.HoaDon;
import com.kada.da.modules.billing.domain.ThanhToan;
import com.kada.da.modules.billing.dto.ThanhToanRequestDTO;
import com.kada.da.modules.billing.dto.ThanhToanResponseDTO;
import com.kada.da.modules.billing.repository.HoaDonRepository;
import com.kada.da.modules.billing.repository.ThanhToanRepository;
import com.kada.da.modules.staff.domain.NhanSu;
import com.kada.da.modules.staff.repository.NhanSuRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ThanhToanServiceImpl implements ThanhToanService {

    private final ThanhToanRepository thanhToanRepository;
    private final HoaDonRepository hoaDonRepository;
    private final NhanSuRepository nhanSuRepository;
    private final jakarta.persistence.EntityManager entityManager;

    @Override
    @Transactional
    public ThanhToan createThanhToan(ThanhToan thanhToan) {
        if (thanhToan.getHoaDon() == null) {
            throw new RuntimeException("Lỗi logic: Đối tượng Hóa đơn không được để trống");
        }
        thanhToan.setMaTt(generateMaTt());
        if (thanhToan.getNgayThanhToan() == null) {
            thanhToan.setNgayThanhToan(LocalDateTime.now());
        }

        // 4. Mặc định trạng thái
        thanhToan.setTrangThai("Hoàn thành");

        // 5. LƯU XUỐNG
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
    public List<ThanhToan> getThanhToanByMaNs(String maNs, LocalDateTime start, LocalDateTime end) {
        return thanhToanRepository.findByNhanSu_MaNsAndNgayThanhToanBetweenOrderByNgayThanhToanDesc(maNs, start, end);
    }

    @Override
    @Transactional
    public String chotThanhToan(String maHd, String maNs, String phuongThuc) {
        log.info("Gọi SP_CHOT_THANH_TOAN_HOA_DON cho hóa đơn: {}", maHd);
        String maTt = thanhToanRepository.chotThanhToanHoaDon(maHd, maNs, phuongThuc);
        log.info("Đã tạo thanh toán thành công, mã giao dịch: {}", maTt);
        return maTt;
    }

    @Override
    @Transactional
    public ThanhToanResponseDTO xuLyThanhToan(ThanhToanRequestDTO request) {
        log.info("Bắt đầu xử lý thanh toán cho HĐ: {}, bởi nhân viên: {}", request.getMaHd(), request.getMaNs());

        // 1. Tìm Hóa đơn
        HoaDon hoaDon = hoaDonRepository.findById(request.getMaHd())
                .orElseThrow(() -> new RuntimeException("KHÔNG TÌM THẤY HÓA ĐƠN: " + request.getMaHd()));

        // 2. Tìm Nhân sự (Hỗ trợ cả maNs lẫn username để tuyệt đối không lỗi)
        NhanSu nhanSu = null;
        if (request.getMaNs() != null) {
            nhanSu = nhanSuRepository.findById(request.getMaNs()).orElse(null);
            if (nhanSu == null) {
                nhanSu = nhanSuRepository.findByTaiKhoanUsername(request.getMaNs()).orElse(null);
            }
        }
        if (nhanSu == null) {
            throw new RuntimeException("KHÔNG TÌM THẤY NHÂN VIÊN MÃ HOẶC USERNAME: " + request.getMaNs());
        }

        // 3. Tạo mã TT mới
        String newMaTt = generateMaTt();

        ThanhToan tt = ThanhToan.builder()
                .maTt(newMaTt)
                .hoaDon(hoaDon)
                .nhanSu(nhanSu)
                .ngayThanhToan(LocalDateTime.now())
                .soTien(request.getSoTien())
                .phuongThuc(request.getHinhThucThanhToan())
                .trangThai("Hoàn thành")
                .build();

        thanhToanRepository.save(tt);
        thanhToanRepository.flush();
        entityManager.refresh(hoaDon);

        log.info("Thanh toán thành công! Mã giao dịch: {}", newMaTt);

        return ThanhToanResponseDTO.builder()
                .maGiaoDich(newMaTt)
                .maHd(hoaDon.getMaHd())
                .tenNhanVienThuNgan(nhanSu.getHoTen())
                .ngayThanhToan(tt.getNgayThanhToan())
                .soTien(tt.getSoTien())
                .hinhThucThanhToan(tt.getPhuongThuc())
                .thongBao("Thanh toán thành công!")
                .build();
    }

    // Hàm tự sinh mã TT
    private synchronized String generateMaTt() {
        try {
            String maxCode = thanhToanRepository.findMaxMaTt();
            if (maxCode == null || maxCode.trim().isEmpty()) {
                return "TT001";
            }
            // Lấy phần số: TT005 -> 005 -> 5 + 1 = 6 -> TT006
            String numericPart = maxCode.replaceAll("[^0-9]", "");
            int nextNumber = numericPart.isEmpty() ? 1 : Integer.parseInt(numericPart) + 1;
            return String.format("TT%03d", nextNumber);
        } catch (Exception e) {
            log.error("Lỗi sinh mã TT: ", e);
            return "TT" + (System.currentTimeMillis() % 1000);
        }
    }
}
