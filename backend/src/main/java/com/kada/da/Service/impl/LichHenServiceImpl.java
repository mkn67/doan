package com.kada.da.Service.impl;

import com.kada.da.Dto.LichHenRequestDTO;
import com.kada.da.Dto.Response.LichHenResponseDTO;
import com.kada.da.Dto.Response.HangChoResponseDTO;
import com.kada.da.Entity.HangCho;
import com.kada.da.Entity.LichHen;
import com.kada.da.Entity.NhanSu;
import com.kada.da.Entity.KhachHang;
import com.kada.da.Entity.TrieuChung;
import com.kada.da.Entity.LichHenTrieuChung; // Bổ sung import
import com.kada.da.Entity.LichHenTrieuChungId; // Bổ sung import
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
import java.util.stream.Collectors;

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
                .loaiLich("Khám mới")
                .build();

        // 👉 LOGIC MỚI: Xử lý theo chuẩn bảng trung gian có khóa kép
        if (requestDTO.getTrieuChung() != null && !requestDTO.getTrieuChung().isEmpty()) {
            List<LichHenTrieuChung> listTc = new java.util.ArrayList<>();
            LichHenTrieuChung lhTc = new LichHenTrieuChung();

            // Set khóa chính kép
            LichHenTrieuChungId tcId = new LichHenTrieuChungId();
            tcId.setMaLh(lichHen.getMaLh());
            tcId.setMaTc("TC001"); // Mặc định gán vào mã TC001 (Nhớ chạy lệnh mồi trong Oracle nhé)
            lhTc.setId(tcId);

            lhTc.setLichHen(lichHen);

            TrieuChung tc = new TrieuChung();
            tc.setMaTc("TC001");
            lhTc.setTrieuChung(tc);

            // Nhét dòng "Nhìn mờ, nhức đầu" từ Postman vào cột mô tả tự do
            lhTc.setMoTaTuDo(requestDTO.getTrieuChung());

            listTc.add(lhTc);
            lichHen.setDanhSachTrieuChung(listTc); // entity LichHen phải dùng List<LichHenTrieuChung> nhé
        }

        lichHen = lichHenRepository.save(lichHen);
        log.info("Đã tạo lịch hẹn thành công với mã: {}", lichHen.getMaLh());

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

        return convertToHangChoResponse(savedHangCho);
    }

    // ==================== PRIVATE MAPPER METHODS ====================

    private LichHen findLichHenById(String maLichHen) {
        return lichHenRepository.findById(maLichHen)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn mã: " + maLichHen));
    }

    private LichHenResponseDTO convertToLichHenResponse(LichHen entity) {
        String trieuChungStr = "";
        if (entity.getDanhSachTrieuChung() != null) {
            // ĐÃ SỬA: Map qua LichHenTrieuChung để lấy cột MoTaTuDo
            trieuChungStr = entity.getDanhSachTrieuChung().stream()
                    .map(LichHenTrieuChung::getMoTaTuDo)
                    .filter(moTa -> moTa != null && !moTa.isEmpty())
                    .collect(Collectors.joining(", "));
        }

        return LichHenResponseDTO.builder()
                .maLh(entity.getMaLh())
                .tenKhachHang(entity.getKhachHang().getHoTen())
                .tenBacSi(entity.getNhanSu().getHoTen())
                .ngayHen(entity.getNgayHen().toLocalDate())
                .gioHen(entity.getGioHen().toLocalTime())
                .trieuChung(trieuChungStr)
                .loaiLich(entity.getLoaiLich())
                .trangThai(entity.getTrangThai())
                .build();
    }

    private HangChoResponseDTO convertToHangChoResponse(HangCho entity) {
        return HangChoResponseDTO.builder()
                .maHangCho(entity.getMaHc())
                .soThuTu(entity.getSoThuTu())
                .tenKhachHang(entity.getKhachHang().getHoTen())
                .tenBacSi(entity.getNhanSuPhanCong().getHoTen())
                .thoiGianBatDauCho(entity.getGioDangKy())
                .thoiGianChoDoiPhut(0L)
                .trangThai(entity.getTrangThai().name())
                .build();
    }
}