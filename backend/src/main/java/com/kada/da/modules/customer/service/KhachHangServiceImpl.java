package com.kada.da.modules.customer.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kada.da.Exception.BusinessRuleException;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.modules.billing.Enum.TrangThaiHoaDon;
import com.kada.da.modules.billing.repository.HoaDonRepository;
import com.kada.da.modules.booking.Enum.TrangThaiLichHen;
import com.kada.da.modules.booking.repository.LichHenRepository;
import com.kada.da.modules.customer.domain.KhachHang;
import com.kada.da.modules.customer.repository.KhachHangRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class KhachHangServiceImpl implements KhachHangService {

    private final KhachHangRepository khachHangRepository;
    private final LichHenRepository lichHenRepository;
    private final HoaDonRepository hoaDonRepository;

    @Override
    public List<KhachHang> layTatCaKhachHang() {
        return khachHangRepository.findAll().stream()
                .filter(kh -> kh.getIsDeleted() == null || kh.getIsDeleted() == 0)
                .collect(Collectors.toList());
    }

    @Override
    public KhachHang timKhachHangTheoId(String maKh) {
        return khachHangRepository.findById(maKh)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay khach hang ma: " + maKh));
    }

    @Override
    public KhachHang timKhachHangTheoSdt(String sdt) {
        return layTatCaKhachHang().stream()
                .filter(kh -> sdt.equals(kh.getSdt()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay khach hang voi SDT: " + sdt));
    }

    private String generateMaKh() {
        List<KhachHang> all = khachHangRepository.findAll();
        int maxSeq = 0;
        for (KhachHang kh : all) {
            String code = kh.getMaKh();
            if (code != null && code.startsWith("KH") && code.length() > 2) {
                try {
                    int num = Integer.parseInt(code.substring(2));
                    if (num > maxSeq) {
                        maxSeq = num;
                    }
                } catch (NumberFormatException ignored) {
                }
            }
        }
        return "KH" + String.format("%03d", maxSeq + 1);
    }

    @Override
    @Transactional
    public KhachHang taoMoiKhachHang(KhachHang khachHang) {
        khachHang.setMaKh(generateMaKh());
        khachHang.setDiemTichLuy(0);
        khachHang.setIsDeleted(0);
        return khachHangRepository.save(khachHang);
    }

    @Override
    @Transactional
    public KhachHang capNhatKhachHang(String maKh, KhachHang khachHangDetails) {
        KhachHang khachHang = timKhachHangTheoId(maKh);
        khachHang.setHoTen(khachHangDetails.getHoTen());
        khachHang.setCccd(khachHangDetails.getCccd());
        khachHang.setNgaySinh(khachHangDetails.getNgaySinh());
        khachHang.setGioiTinh(khachHangDetails.getGioiTinh());
        khachHang.setSdt(khachHangDetails.getSdt());
        khachHang.setDiaChi(khachHangDetails.getDiaChi());
        return khachHangRepository.save(khachHang);
    }

    @Override
    @Transactional
    public void xoaMemKhachHang(String maKh) {
        KhachHang khachHang = timKhachHangTheoId(maKh);
        if (Integer.valueOf(1).equals(khachHang.getIsDeleted())) {
            throw new BusinessRuleException("Ho so khach hang da duoc xoa truoc do");
        }

        boolean hasActiveAppointment = lichHenRepository.existsByKhachHang_MaKhAndTrangThaiIn(
                maKh,
                List.of(
                        TrangThaiLichHen.CHO_XAC_NHAN,
                        TrangThaiLichHen.DA_XAC_NHAN,
                        TrangThaiLichHen.DA_CHECK_IN));
        if (hasActiveAppointment) {
            throw new BusinessRuleException("Khong the xoa ho so da co lich hen chua hoan thanh");
        }

        if (hoaDonRepository.existsByKhachHang_MaKhAndTrangThai(maKh, TrangThaiHoaDon.CHUA_THANH_TOAN)) {
            throw new BusinessRuleException("Khong the xoa ho so da co hoa don chua thanh toan");
        }

        khachHang.setIsDeleted(1);
        khachHangRepository.save(khachHang);
    }

    @Override
    @Transactional
    public void congDiemThuCong(String maKh, Integer soDiem, String lyDo, String maHd) {
        log.info("Goi SP_CONG_DIEM: khach={}, diem={}, ly do={}, ma HD={}",
                maKh, soDiem, lyDo, maHd != null ? maHd : "Khong co");
        khachHangRepository.congDiemThuCong(maKh, soDiem, lyDo, maHd);
        log.info("Cong diem thu cong thanh cong cho khach hang: {}", maKh);
    }

    @Override
    @Transactional(readOnly = true)
    public String layLichSuKhamMoiNhat(String maKh) {
        log.info("Dang goi Function Oracle lay lich su cho khach hang: {}", maKh);
        String ketQua = khachHangRepository.getLichSuKhamCuoi(maKh);
        return (ketQua != null) ? ketQua : "Khong the lay thong tin lich su kham.";
    }
}
