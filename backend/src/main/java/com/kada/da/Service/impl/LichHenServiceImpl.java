package com.kada.da.Service.impl;

import com.kada.da.Dto.LichHenRequestDTO;
import com.kada.da.Dto.Response.LichHenResponseDTO;
import com.kada.da.Entity.HangCho;
import com.kada.da.Entity.LichHen;
import com.kada.da.Entity.NhanSu;
import com.kada.da.Entity.KhachHang;
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
import java.time.LocalTime;

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

        // 1. Kiểm tra khách hàng và bác sĩ tồn tại
        KhachHang khachHang = khachHangRepository.findById(requestDTO.getMaKhachHang())
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng không tồn tại"));
        NhanSu bacSi = nhanSuRepository.findById(requestDTO.getMaBacSi())
                .orElseThrow(() -> new ResourceNotFoundException("Bác sĩ không tồn tại"));

        // 2. Kiểm tra bác sĩ có rảnh khung giờ đó không (giả sử có phương thức)
        if (!isBacSiRanh(bacSi.getMaNhanSu(), requestDTO.getThoiGianBatDau())) {
            throw new BusinessRuleException("Bác sĩ đã có lịch hẹn hoặc không làm việc vào khung giờ này");
        }

        // 3. Tạo entity và map dữ liệu
        LichHen lichHen = LichHen.builder()
                .khachHang(khachHang)
                .nhanSu(bacSi)
                .thoiGianBatDau(requestDTO.getThoiGianBatDau())
                .thoiGianKetThuc(requestDTO.getThoiGianBatDau().plusMinutes(30)) // giả sử mỗi ca 30p
                .lyDoKham(requestDTO.getLyDoKham())
                .trangThai(TrangThaiLichHen.CHO_XAC_NHAN)
                .ghiChu(requestDTO.getGhiChu())
                .build();

        lichHen = lichHenRepository.save(lichHen);
        log.info("Đã tạo lịch hẹn thành công với mã: {}", lichHen.getMaLichHen());

        return new LichHenResponseDTO(lichHen);
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
        return new LichHenResponseDTO(saved);
    }

    @Override
    @Transactional
    public void cancelLichHen(String maLichHen, String lyDo) {
        LichHen lichHen = findLichHenById(maLichHen);

        // Không cho hủy nếu đã check-in hoặc hoàn thành
        if (lichHen.getTrangThai() == TrangThaiLichHen.DA_CHECK_IN ||
                lichHen.getTrangThai() == TrangThaiLichHen.HOAN_THANH) {
            throw new BusinessRuleException("Không thể hủy lịch hẹn đã check-in hoặc hoàn thành");
        }

        lichHen.setTrangThai(TrangThaiLichHen.DA_HUY);
        lichHen.setGhiChu(lyDo);
        lichHenRepository.save(lichHen);
        log.info("Đã hủy lịch hẹn: {} với lý do: {}", maLichHen, lyDo);
    }

    @Override
    @Transactional
    public HangCho checkIn(String maLichHen) {
        LichHen lichHen = findLichHenById(maLichHen);

        // Chỉ cho phép check-in lịch đã được xác nhận
        if (lichHen.getTrangThai() != TrangThaiLichHen.DA_XAC_NHAN) {
            throw new BusinessRuleException("Khách hàng chưa được xác nhận lịch hẹn, không thể check-in!");
        }

        // Kiểm tra xem khách có đến đúng ngày không?
        LocalDate today = LocalDate.now();
        if (!lichHen.getThoiGianBatDau().toLocalDate().equals(today)) {
            throw new BusinessRuleException("Lịch hẹn không phải hôm nay, không thể check-in");
        }

        // Chuyển trạng thái lịch hẹn
        lichHen.setTrangThai(TrangThaiLichHen.DA_CHECK_IN);
        lichHenRepository.save(lichHen);

        // Tạo số thứ tự hàng chờ
        int maxStt = hangChoRepository.getMaxSoThuTuToday(); // cần implement native query
        int soThuTu = maxStt + 1;

        HangCho hangCho = HangCho.builder()
                .khachHang(lichHen.getKhachHang())
                .nhanSu(lichHen.getNhanSu())
                .thoiGianDangKy(LocalDateTime.now())
                .soThuTu(soThuTu)
                .trangThai("Đang chờ") // có thể dùng enum riêng cho hàng chờ
                .loaiKhach("Online")
                .build();

        HangCho saved = hangChoRepository.save(hangCho);
        log.info("Check-in thành công cho lịch hẹn {} - Số thứ tự: {}", maLichHen, soThuTu);
        return saved;
    }

    // Helper method
    private LichHen findLichHenById(String maLichHen) {
        return lichHenRepository.findById(maLichHen)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn mã: " + maLichHen));
    }

    private boolean isBacSiRanh(String maBacSi, LocalDateTime thoiGianBatDau) {
        // Kiểm tra xem bác sĩ có lịch hẹn nào trùng khung giờ không
        // Có thể implement trong repository
        return !lichHenRepository.existsByNhanSu_MaNhanSuAndThoiGianBatDauBetween(
                maBacSi, thoiGianBatDau, thoiGianBatDau.plusMinutes(30));
    }
}