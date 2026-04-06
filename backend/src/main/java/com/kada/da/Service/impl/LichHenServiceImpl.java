package com.kada.da.Service.impl;

import com.kada.da.Dto.LichHenRequestDTO;
import com.kada.da.Dto.Response.LichHenResponseDTO;
import com.kada.da.Entity.HangCho;
import com.kada.da.Entity.LichHen;
import com.kada.da.Entity.NhanSu;
import com.kada.da.Entity.KhachHang;
import com.kada.da.Enum.TrangThaiHangCho; // Import thêm cái này
import com.kada.da.Enum.TrangThaiLichHen;
import com.kada.da.Exception.BusinessRuleException;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.Repository.HangChoRepository;
import com.kada.da.Repository.LichHenRepository;
import com.kada.da.Repository.KhachHangRepository;
import com.kada.da.Repository.NhanSuRepository;
import com.kada.da.Service.LichHenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class LichHenServiceImpl implements LichHenService {

    private final LichHenRepository lichHenRepository;
    private final HangChoRepository hangChoRepository;
    private final KhachHangRepository khachHangRepository;
    private final NhanSuRepository nhanSuRepository;

    @Override
    @Transactional
    public LichHenResponseDTO createLichHen(LichHenRequestDTO requestDTO) {
        log.info("Tạo lịch hẹn mới cho khách hàng: {}", requestDTO.getMaKhachHang());

        KhachHang khachHang = khachHangRepository.findById(requestDTO.getMaKhachHang())
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng không tồn tại"));
        NhanSu bacSi = nhanSuRepository.findById(requestDTO.getMaBacSi())
                .orElseThrow(() -> new ResourceNotFoundException("Bác sĩ không tồn tại"));

        // ĐÃ SỬA: Kiểm tra DB bằng Enum (Nếu trong Repository ông vẫn để tham số
        // List<String> thì nhớ đổi thành List<TrangThaiLichHen>)
        boolean hasActiveBooking = lichHenRepository.existsByKhachHang_MaKhAndTrangThaiIn(
                khachHang.getMaKh(),
                List.of(TrangThaiLichHen.CHO_XAC_NHAN, TrangThaiLichHen.DA_XAC_NHAN));

        if (hasActiveBooking) {
            throw new BusinessRuleException("Khách hàng đã có một lịch hẹn đang chờ xử lý.");
        }

        String generatedMaLh = "LH" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        LichHen lichHen = LichHen.builder()
                .maLh(generatedMaLh)
                .khachHang(khachHang)
                .nhanSu(bacSi)
                .ngayHen(requestDTO.getNgayHen().atStartOfDay())
                .gioHen(requestDTO.getNgayHen().atTime(requestDTO.getGioHen()))
                .trangThai(TrangThaiLichHen.CHO_XAC_NHAN) // ĐÃ SỬA: Dùng Enum
                .trieuChung(requestDTO.getTrieuChung())
                .loaiLich("Khám mới")
                .build();

        lichHen = lichHenRepository.save(lichHen);
        log.info("Đã tạo lịch hẹn thành công với mã: {}", lichHen.getMaLh());

        return new LichHenResponseDTO(lichHen);
    }

    @Override
    @Transactional
    public LichHenResponseDTO confirmLichHen(String maLichHen) {
        LichHen lichHen = findLichHenById(maLichHen);

        // ĐÃ SỬA: So sánh bằng toán tử != với Enum
        if (lichHen.getTrangThai() != TrangThaiLichHen.CHO_XAC_NHAN) {
            throw new BusinessRuleException("Chỉ có thể xác nhận lịch hẹn đang ở trạng thái 'Chờ xác nhận'");
        }

        lichHen.setTrangThai(TrangThaiLichHen.DA_XAC_NHAN); // ĐÃ SỬA
        LichHen saved = lichHenRepository.save(lichHen);
        log.info("Đã xác nhận lịch hẹn: {}", maLichHen);
        return new LichHenResponseDTO(saved);
    }

    @Override
    @Transactional
    public void cancelLichHen(String maLichHen, String lyDo) {
        LichHen lichHen = findLichHenById(maLichHen);

        // ĐÃ SỬA: So sánh bằng Enum
        if (lichHen.getTrangThai() == TrangThaiLichHen.DA_CHECK_IN) {
            throw new BusinessRuleException("Không thể hủy lịch hẹn đã check-in");
        }

        if (lichHen.getTrangThai() == TrangThaiLichHen.DA_HUY) {
            throw new BusinessRuleException("Lịch hẹn này đã bị hủy từ trước rồi");
        }

        lichHen.setTrangThai(TrangThaiLichHen.DA_HUY); // ĐÃ SỬA

        log.warn("Lịch hẹn {} bị hủy. Lý do: {}", maLichHen, lyDo);

        lichHenRepository.save(lichHen);
        log.info("Đã hủy lịch hẹn: {}", maLichHen);
    }

    @Override
    @Transactional
    public HangCho checkIn(String maLichHen) {
        LichHen lichHen = findLichHenById(maLichHen);

        // ĐÃ SỬA
        if (lichHen.getTrangThai() != TrangThaiLichHen.DA_XAC_NHAN) {
            throw new BusinessRuleException("Khách hàng chưa được xác nhận lịch hẹn, không thể check-in!");
        }

        LocalDate today = LocalDate.now();
        if (lichHen.getNgayHen() == null || !lichHen.getNgayHen().toLocalDate().equals(today)) {
            throw new BusinessRuleException("Lịch hẹn không phải hôm nay, không thể check-in");
        }

        lichHen.setTrangThai(TrangThaiLichHen.DA_CHECK_IN); // ĐÃ SỬA
        lichHenRepository.save(lichHen);

        Integer maxSttToday = hangChoRepository.findMaxSoThuTuToday();
        int maxStt = (maxSttToday != null) ? maxSttToday : 0;
        int soThuTu = maxStt + 1;

        String generatedMaHc = "HC" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        HangCho hangCho = HangCho.builder()
                .maHc(generatedMaHc)
                .soThuTu(soThuTu)
                .trangThai(TrangThaiHangCho.DANG_CHO) // ĐÃ SỬA: Dùng Enum TrangThaiHangCho
                .gioDangKy(LocalDateTime.now())
                .khachHang(lichHen.getKhachHang())
                .lichHen(lichHen)
                .nhanSuPhanCong(lichHen.getNhanSu())
                .build();

        log.info("Check-in thành công cho lịch hẹn {} - STT: {}", maLichHen, soThuTu);
        return hangChoRepository.save(hangCho);
    }

    private LichHen findLichHenById(String maLichHen) {
        return lichHenRepository.findById(maLichHen)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn mã: " + maLichHen));
    }
}