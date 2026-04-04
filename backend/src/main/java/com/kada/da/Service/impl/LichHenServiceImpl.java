package com.kada.da.Service.impl;

import com.kada.da.Dto.LichHenRequestDTO; // Nhớ check lại đường dẫn package này của ông
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

        // 1. Kiểm tra khách hàng và bác sĩ tồn tại
        KhachHang khachHang = khachHangRepository.findById(requestDTO.getMaKhachHang())
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng không tồn tại"));
        NhanSu bacSi = nhanSuRepository.findById(requestDTO.getMaBacSi())
                .orElseThrow(() -> new ResourceNotFoundException("Bác sĩ không tồn tại"));

        // 2. Kiểm tra khách hàng đã có lịch hẹn chưa hoàn thành/hủy chưa
        boolean hasActiveBooking = lichHenRepository.existsByKhachHang_MaKhAndTrangThaiIn(
                khachHang.getMaKh(),
                List.of(TrangThaiLichHen.CHO_XAC_NHAN.getValue(), TrangThaiLichHen.DA_XAC_NHAN.getValue()));
        if (hasActiveBooking) {
            throw new BusinessRuleException("Khách hàng đã có một lịch hẹn đang chờ xử lý.");
        }

        // 3. QUAN TRỌNG: Tự động sinh mã Lịch Hẹn (Tối đa 10 ký tự theo Entity của ông)
        // Cắt 8 ký tự đầu của UUID ghép với chữ "LH"
        String generatedMaLh = "LH" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // 4. Tạo entity và map dữ liệu (Đã ép kiểu thời gian chuẩn)
        LichHen lichHen = LichHen.builder()
                .maLh(generatedMaLh) // Set mã khóa chính
                .khachHang(khachHang)
                .nhanSu(bacSi)
                .ngayHen(requestDTO.getNgayHen().atStartOfDay())
                .gioHen(requestDTO.getNgayHen().atTime(requestDTO.getGioHen()))
                .trangThai(TrangThaiLichHen.CHO_XAC_NHAN.getValue())
                .trieuChung(requestDTO.getTrieuChung())
                .loaiLich("Khám mới") // Default
                .build();

        lichHen = lichHenRepository.save(lichHen);
        log.info("Đã tạo lịch hẹn thành công với mã: {}", lichHen.getMaLh());

        return new LichHenResponseDTO(lichHen);
    }

    @Override
    @Transactional
    public LichHenResponseDTO confirmLichHen(String maLichHen) {
        LichHen lichHen = findLichHenById(maLichHen);

        if (!TrangThaiLichHen.CHO_XAC_NHAN.getValue().equals(lichHen.getTrangThai())) {
            throw new BusinessRuleException("Chỉ có thể xác nhận lịch hẹn đang ở trạng thái 'Chờ xác nhận'");
        }

        lichHen.setTrangThai(TrangThaiLichHen.DA_XAC_NHAN.getValue());
        LichHen saved = lichHenRepository.save(lichHen);
        log.info("Đã xác nhận lịch hẹn: {}", maLichHen);
        return new LichHenResponseDTO(saved);
    }

    @Override
    @Transactional
    public void cancelLichHen(String maLichHen, String lyDo) {
        LichHen lichHen = findLichHenById(maLichHen);

        // Không cho hủy nếu đã check-in hoặc hoàn thành
        if (TrangThaiLichHen.DA_CHECK_IN.getValue().equals(lichHen.getTrangThai())) {
            throw new BusinessRuleException("Không thể hủy lịch hẹn đã check-in");
        }

        if (TrangThaiLichHen.DA_HUY.getValue().equals(lichHen.getTrangThai())) {
            throw new BusinessRuleException("Lịch hẹn này đã bị hủy từ trước rồi");
        }

        lichHen.setTrangThai(TrangThaiLichHen.DA_HUY.getValue());

        // Ghi log lý do hủy (Vì DB ông không thiết kế cột ghi chú hủy)
        log.warn("Lịch hẹn {} bị hủy. Lý do: {}", maLichHen, lyDo);

        lichHenRepository.save(lichHen);
        log.info("Đã hủy lịch hẹn: {}", maLichHen);
    }

    @Override
    @Transactional
    public HangCho checkIn(String maLichHen) {
        LichHen lichHen = findLichHenById(maLichHen);

        // 1. Chỉ cho phép check-in lịch đã được xác nhận
        if (!TrangThaiLichHen.DA_XAC_NHAN.getValue().equals(lichHen.getTrangThai())) {
            throw new BusinessRuleException("Khách hàng chưa được xác nhận lịch hẹn, không thể check-in!");
        }

        // 2. Kiểm tra ngày hẹn (Lịch hẹn của ông là LocalDateTime nên phải toLocalDate)
        LocalDate today = LocalDate.now();
        if (lichHen.getNgayHen() == null || !lichHen.getNgayHen().toLocalDate().equals(today)) {
            throw new BusinessRuleException("Lịch hẹn không phải hôm nay, không thể check-in");
        }

        // 3. Chuyển trạng thái lịch hẹn
        lichHen.setTrangThai(TrangThaiLichHen.DA_CHECK_IN.getValue());
        lichHenRepository.save(lichHen);

        // 4. Tạo số thứ tự hàng chờ
        int maxStt = hangChoRepository.findMaxSoThuTuToday().orElse(0);
        int soThuTu = maxStt + 1;

        // 5. Sinh mã Hàng Chờ ngẫu nhiên (vì maHc dài 10 ký tự)
        String generatedMaHc = "HC" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // 6. Build Entity HangCho chuẩn theo tên biến của ông
        HangCho hangCho = HangCho.builder()
                .maHc(generatedMaHc)
                .soThuTu(soThuTu)
                .trangThai("Đang chờ")
                .gioDangKy(LocalDateTime.now()) // Đã sửa theo tên biến của ông
                .khachHang(lichHen.getKhachHang())
                .lichHen(lichHen)
                .nhanSuPhanCong(lichHen.getNhanSu()) // Đã sửa: nhanSuPhanCong
                .build();

        log.info("Check-in thành công cho lịch hẹn {} - STT: {}", maLichHen, soThuTu);
        return hangChoRepository.save(hangCho);
    }

    // Helper method (Hàm phụ trợ gộp code cho gọn)
    private LichHen findLichHenById(String maLichHen) {
        return lichHenRepository.findById(maLichHen)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn mã: " + maLichHen));
    }
}