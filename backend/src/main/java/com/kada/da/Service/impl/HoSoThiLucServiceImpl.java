package com.kada.da.Service.impl;

import com.kada.da.Entity.HoSoThiLuc;
import com.kada.da.Entity.LichHen;
import com.kada.da.Enum.TrangThaiLichHen;
import com.kada.da.Exception.BusinessRuleException;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.Repository.HoSoThiLucRepository;
import com.kada.da.Repository.LichHenRepository;
import com.kada.da.Service.HoSoThiLucService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class HoSoThiLucServiceImpl implements HoSoThiLucService {

    private final HoSoThiLucRepository hoSoThiLucRepository;
    private final LichHenRepository lichHenRepository;

    @Override
    @Transactional
    public HoSoThiLuc taoHoSoKham(HoSoThiLuc hoSoThiLuc, String maLichHen) {
        LichHen lichHen = lichHenRepository.findById(maLichHen)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn"));

        // ĐÃ SỬA: So sánh trực tiếp với Enum, không dùng getValue()
        if (lichHen.getTrangThai() != TrangThaiLichHen.DA_CHECK_IN) {
            throw new BusinessRuleException("Khách hàng chưa check-in, không thể lưu kết quả khám!");
        }

        String generatedMaHs = "HS" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        hoSoThiLuc.setMaHoSo(generatedMaHs);
        hoSoThiLuc.setKhachHang(lichHen.getKhachHang());
        hoSoThiLuc.setNhanSu(lichHen.getNhanSu());
        hoSoThiLuc.setNgayKham(LocalDate.now());

        if (hoSoThiLuc.getChiTietThiLucs() != null) {
            hoSoThiLuc.getChiTietThiLucs().forEach(chiTiet -> {
                chiTiet.setHoSoThiLuc(hoSoThiLuc);
            });
        }

        HoSoThiLuc savedHoSo = hoSoThiLucRepository.save(hoSoThiLuc);

        // ĐÃ SỬA: Set trạng thái bằng Enum
        lichHen.setTrangThai(TrangThaiLichHen.DA_CHECK_IN);
        lichHenRepository.save(lichHen);

        log.info("Bác sĩ {} đã lưu hồ sơ khám {} cho bệnh nhân {}",
                lichHen.getNhanSu().getHoTen(), savedHoSo.getMaHoSo(), lichHen.getKhachHang().getHoTen());

        return savedHoSo;
    }

    @Override
    public List<HoSoThiLuc> layLichSuKham(String maKhachHang) {
        return hoSoThiLucRepository.findByKhachHang_MaKhOrderByNgayKhamDesc(maKhachHang);
    }

    @Override
    public HoSoThiLuc xemChiTietHoSo(String maHoSo) {
        return hoSoThiLucRepository.findById(maHoSo)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ thị lực: " + maHoSo));
    }

    // --- Method mới gọi SP (dùng chính repository đó) ---
    @Override
    public Map<String, String> taoHoSoKhamBangSP(
            String maKhachHang, String maBacSi, String ketLuan,
            Double matTraiSph, Double matTraiCyl, Integer matTraiAx, Double docongTrai,
            Double matPhaiSph, Double matPhaiCyl, Integer matPhaiAx, Double docongPhai,
            Double pd) {

        log.info("Gọi SP_LUU_HOSO_KHAM_BENH cho bệnh nhân: {}", maKhachHang);
        Map<String, String> result = hoSoThiLucRepository.luuHoSoKhamBenh(
                maKhachHang, maBacSi, ketLuan,
                matTraiSph, matTraiCyl, matTraiAx, docongTrai,
                matPhaiSph, matPhaiCyl, matPhaiAx, docongPhai,
                pd);
        log.info("SP tạo thành công: maHoso={}, maDon={}", result.get("maHoso"), result.get("maDon"));
        return result;
    }
}