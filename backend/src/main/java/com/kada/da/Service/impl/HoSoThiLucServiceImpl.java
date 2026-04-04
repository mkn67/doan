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
        // 1. Kiểm tra lịch hẹn (Khách phải check-in rồi mới được khám)
        LichHen lichHen = lichHenRepository.findById(maLichHen)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn"));

        if (!TrangThaiLichHen.DA_CHECK_IN.getValue().equals(lichHen.getTrangThai())) {
            throw new BusinessRuleException("Khách hàng chưa check-in, không thể lưu kết quả khám!");
        }

        // 2. Sinh mã Hồ sơ tự động (Ví dụ: HS...)
        String generatedMaHs = "HS" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        hoSoThiLuc.setMaHoSo(generatedMaHs);

        // 3. Gắn thông tin cơ bản
        hoSoThiLuc.setKhachHang(lichHen.getKhachHang());
        hoSoThiLuc.setNhanSu(lichHen.getNhanSu()); // Bác sĩ khám
        hoSoThiLuc.setNgayKham(LocalDate.now());

        // 4. Nếu frontend gửi kèm ChiTietThiLuc (mắt trái, mắt phải), phải map ngược
        // lại để JPA lưu được
        if (hoSoThiLuc.getChiTietThiLucs() != null) {
            hoSoThiLuc.getChiTietThiLucs().forEach(chiTiet -> {
                chiTiet.setHoSoThiLuc(hoSoThiLuc); // Gắn khóa ngoại
            });
        }

        // 5. Lưu xuống DB
        HoSoThiLuc savedHoSo = hoSoThiLucRepository.save(hoSoThiLuc);

        // 6. Đổi trạng thái lịch hẹn thành "Hoàn thành"
        lichHen.setTrangThai("Hoàn thành");
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
}