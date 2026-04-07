package com.kada.da.Service.impl;

import com.kada.da.Dto.LichHenRequestDTO;
import com.kada.da.Dto.Response.LichHenResponseDTO;
import com.kada.da.Dto.Response.HangChoResponseDTO; // Bổ sung Import DTO
import com.kada.da.Entity.HangCho;
import com.kada.da.Entity.LichHen;
import com.kada.da.Entity.NhanSu;
import com.kada.da.Entity.KhachHang;
import com.kada.da.Enum.TrangThaiHangCho;
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
                .trangThai(TrangThaiLichHen.CHO_XAC_NHAN)
                .trieuChung(requestDTO.getTrieuChung())
                .loaiLich("Khám mới")
                .build();

        lichHen = lichHenRepository.save(lichHen);
        log.info("Đã tạo lịch hẹn thành công với mã: {}", lichHen.getMaLh());

        // ĐÃ SỬA: Dùng hàm map chuẩn
        return convertToLichHenResponse(lichHen);
    }

    @Override
    @Transactional
    public LichHenResponseDTO confirmLichHen(String maLichHen) {
        LichHen lichHen = findLichHenById(maLichHen);

        if (lichHen.getTrangThai() != TrangThaiLichHen.CHO_XAC_NHAN) {
            throw new BusinessRuleException("Chỉ có thể xác nhận lịch hẹn đang ở trạng thái 'Chờ xác nhận'");
        }

        lichHen.setTrangThai(TrangThaiLichHen.DA_XAC_NHAN);
        LichHen saved = lichHenRepository.save(lichHen);
        log.info("Đã xác nhận lịch hẹn: {}", maLichHen);

        // ĐÃ SỬA: Dùng hàm map chuẩn
        return convertToLichHenResponse(saved);
    }

    @Override
    @Transactional
    public void cancelLichHen(String maLichHen, String lyDo) {
        LichHen lichHen = findLichHenById(maLichHen);

        if (lichHen.getTrangThai() == TrangThaiLichHen.DA_CHECK_IN) {
            throw new BusinessRuleException("Không thể hủy lịch hẹn đã check-in");
        }

        if (lichHen.getTrangThai() == TrangThaiLichHen.DA_HUY) {
            throw new BusinessRuleException("Lịch hẹn này đã bị hủy từ trước rồi");
        }

        lichHen.setTrangThai(TrangThaiLichHen.DA_HUY);

        log.warn("Lịch hẹn {} bị hủy. Lý do: {}", maLichHen, lyDo);

        lichHenRepository.save(lichHen);
        log.info("Đã hủy lịch hẹn: {}", maLichHen);
    }

    @Override
    @Transactional
    // ĐÃ SỬA KIỂU TRẢ VỀ: Phải là HangChoResponseDTO
    public HangChoResponseDTO checkIn(String maLichHen) {
        LichHen lichHen = findLichHenById(maLichHen);

        if (lichHen.getTrangThai() != TrangThaiLichHen.DA_XAC_NHAN) {
            throw new BusinessRuleException("Khách hàng chưa được xác nhận lịch hẹn, không thể check-in!");
        }

        LocalDate today = LocalDate.now();
        if (lichHen.getNgayHen() == null || !lichHen.getNgayHen().toLocalDate().equals(today)) {
            throw new BusinessRuleException("Lịch hẹn không phải hôm nay, không thể check-in");
        }

        lichHen.setTrangThai(TrangThaiLichHen.DA_CHECK_IN);
        lichHenRepository.save(lichHen);

        Integer maxSttToday = hangChoRepository.findMaxSoThuTuToday();
        int maxStt = (maxSttToday != null) ? maxSttToday : 0;
        int soThuTu = maxStt + 1;

        String generatedMaHc = "HC" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        HangCho hangCho = HangCho.builder()
                .maHc(generatedMaHc)
                .soThuTu(soThuTu)
                .trangThai(TrangThaiHangCho.DANG_CHO)
                .gioDangKy(LocalDateTime.now())
                .khachHang(lichHen.getKhachHang())
                .lichHen(lichHen)
                .nhanSuPhanCong(lichHen.getNhanSu())
                .build();

        HangCho savedHangCho = hangChoRepository.save(hangCho);
        log.info("Check-in thành công cho lịch hẹn {} - STT: {}", maLichHen, soThuTu);

        // ĐÃ SỬA: Map Entity ra DTO
        return convertToHangChoResponse(savedHangCho);
    }

    // ==================== PRIVATE MAPPER METHODS ====================

    private LichHen findLichHenById(String maLichHen) {
        return lichHenRepository.findById(maLichHen)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn mã: " + maLichHen));
    }

    private LichHenResponseDTO convertToLichHenResponse(LichHen entity) {
        return LichHenResponseDTO.builder()
                .maLh(entity.getMaLh())
                .tenKhachHang(entity.getKhachHang().getHoTen())
                .tenBacSi(entity.getNhanSu().getHoTen())
                .ngayHen(entity.getNgayHen().toLocalDate()) // Chuyển LocalDateTime về LocalDate
                .gioHen(entity.getGioHen().toLocalTime()) // Chuyển LocalDateTime về LocalTime
                .trieuChung(entity.getTrieuChung())
                .loaiLich(entity.getLoaiLich())
                .trangThai(entity.getTrangThai()) // Chuyển Enum thành String
                .build();
    }

    private HangChoResponseDTO convertToHangChoResponse(HangCho entity) {
        return HangChoResponseDTO.builder()
                .maHangCho(entity.getMaHc())
                .soThuTu(entity.getSoThuTu())
                .tenKhachHang(entity.getKhachHang().getHoTen())
                .tenBacSi(entity.getNhanSuPhanCong().getHoTen())
                // ĐÃ SỬA: Đổi từ gioDangKy thành thoiGianBatDauCho cho khớp với DTO
                .thoiGianBatDauCho(entity.getGioDangKy())
                // BỔ SUNG: Vừa mới check-in xong thì thời gian chờ đợi dĩ nhiên là 0 phút
                .thoiGianChoDoiPhut(0L)

                .trangThai(entity.getTrangThai().name())
                .build();
    }
}