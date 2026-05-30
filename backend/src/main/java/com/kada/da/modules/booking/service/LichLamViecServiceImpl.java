package com.kada.da.modules.booking.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kada.da.Exception.BusinessRuleException;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.modules.booking.Enum.TrangThaiLichHen;
import com.kada.da.modules.booking.domain.LichHen;
import com.kada.da.modules.booking.domain.LichLamViec;
import com.kada.da.modules.booking.dto.LichLamViecRequestDTO;
import com.kada.da.modules.booking.dto.LichLamViecResponseDTO;
import com.kada.da.modules.booking.dto.SlotTrongDto;
import com.kada.da.modules.booking.repository.LichHenRepository;
import com.kada.da.modules.booking.repository.LichLamViecRepository;
import com.kada.da.modules.staff.domain.NhanSu;
import com.kada.da.modules.staff.dto.PageResponseDTO;
import com.kada.da.modules.staff.repository.NhanSuRepository;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class LichLamViecServiceImpl implements LichLamViecService {

    private final LichLamViecRepository lichLamViecRepository;
    private final NhanSuRepository nhanSuRepository;
    private final LichHenRepository lichHenRepository;
    private final EntityManager entityManager;

    // =========================================================
    // 1. TẠO LỊCH BẰNG STORED PROCEDURE (MỚI)
    // =========================================================
    @Override
    @Transactional
    public void taoLichLamViec(LichLamViecRequestDTO request) {
        log.info("Tao lich lam viec cho nhan su: {}, ngay: {}, gio: {}",
                request.getMaNs(), request.getNgayLam(), request.getGioBatDau());

        NhanSu nhanSu = nhanSuRepository.findById(request.getMaNs())
                .orElseThrow(() -> new BusinessRuleException("Nhan su khong ton tai hoac da nghi!"));
        if (Integer.valueOf(1).equals(nhanSu.getIsDeleted())) {
            throw new BusinessRuleException("Nhan su khong ton tai hoac da nghi!");
        }
        if (request.getGioBatDau() == null || request.getGioKetThuc() == null
                || request.getGioBatDau() >= request.getGioKetThuc()) {
            throw new BusinessRuleException("Gio ket thuc phai > gio bat dau!");
        }

        Integer isNghi = request.getIsNghi() != null ? request.getIsNghi() : 0;
        if (!lichLamViecRepository.findOverlappingWorkingSlots(
                request.getMaNs(),
                request.getNgayLam(),
                request.getGioBatDau(),
                request.getGioKetThuc()).isEmpty()) {
            throw new BusinessRuleException("Khung gio bi trung lich!");
        }

        LichLamViec lichLamViec = LichLamViec.builder()
                .maLlv(nextCode("SEQ_LICH_LAM_VIEC", "LV"))
                .nhanSu(nhanSu)
                .ngayLam(request.getNgayLam())
                .gioBatDau(request.getGioBatDau())
                .gioKetThuc(request.getGioKetThuc())
                .isNghi(isNghi)
                .build();
        lichLamViecRepository.save(lichLamViec);
        log.info("Tạo lịch làm việc thành công!");
    }

    @Override
    @Transactional
    public void createLichLamViecBatch(List<LichLamViecRequestDTO> requests) {
        log.info("Tạo hàng loạt {} lịch làm việc bằng SP", requests.size());
        // Lặp qua danh sách và gọi SP cho từng cái
        requests.forEach(this::taoLichLamViec);
    }

    // =========================================================
    // 2. CÁC HÀM GET & UPDATE & DELETE (DÙNG JPA BÌNH THƯỜNG)
    // =========================================================
    @Override
    public LichLamViecResponseDTO getLichLamViecById(String maLlv) {
        log.info("Lấy lịch làm việc theo mã: {}", maLlv);
        LichLamViec entity = lichLamViecRepository.findById(maLlv)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch làm việc với mã: " + maLlv));
        return convertToResponseDTO(entity);
    }

    @Override
    public PageResponseDTO<LichLamViecResponseDTO> getAllLichLamViec(int page, int size) {
        log.info("Lấy danh sách lịch làm việc - page: {}, size: {}", page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<LichLamViec> pageResult = lichLamViecRepository.findAll(pageable);

        List<LichLamViecResponseDTO> content = pageResult.getContent().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());

        return PageResponseDTO.<LichLamViecResponseDTO>builder()
                .content(content)
                .pageNo(page)
                .pageSize(size)
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    @Override
    public List<LichLamViecResponseDTO> getLichLamViecByNhanSu(String maNs) {
        log.info("Lấy lịch làm việc theo nhân sự: {}", maNs);

        NhanSu nhanSu = nhanSuRepository.findById(maNs)
                .orElseThrow(() -> new ResourceNotFoundException("Nhân sự không tồn tại: " + maNs));

        List<LichLamViec> list = lichLamViecRepository.findByNhanSuOrderByNgayLamAsc(nhanSu);
        return list.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<LichLamViecResponseDTO> getLichLamViecByNhanSuAndDateRange(String maNs, LocalDate fromDate,
            LocalDate toDate) {
        log.info("Lấy lịch làm việc theo nhân sự {} từ {} đến {}", maNs, fromDate, toDate);

        NhanSu nhanSu = nhanSuRepository.findById(maNs)
                .orElseThrow(() -> new ResourceNotFoundException("Nhân sự không tồn tại: " + maNs));

        List<LichLamViec> list = lichLamViecRepository.findByNhanSuAndNgayLamBetween(nhanSu, fromDate, toDate);
        return list.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<LichLamViecResponseDTO> getLichLamViecByNgay(LocalDate ngay) {
        log.info("Lấy lịch làm việc theo ngày: {}", ngay);
        List<LichLamViec> list = lichLamViecRepository.findByNgayLam(ngay);
        return list.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<LichLamViecResponseDTO> getLichLamViecByKhungGio(Double gioBatDau, Double gioKetThuc) {
        log.info("Lấy lịch làm việc theo khung giờ: {} - {}", gioBatDau, gioKetThuc);
        List<LichLamViec> list = lichLamViecRepository.findByGioBatDauAndGioKetThuc(gioBatDau, gioKetThuc);
        return list.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public boolean isNhanSuRanh(String maNs, LocalDate ngay, Double gioBatDau) {
        log.info("Kiểm tra nhân sự {} rảnh ngày {} lúc {}", maNs, ngay, gioBatDau);

        NhanSu nhanSu = nhanSuRepository.findById(maNs)
                .orElseThrow(() -> new ResourceNotFoundException("Nhân sự không tồn tại: " + maNs));

        return !lichLamViecRepository.existsByNhanSuAndNgayLamAndGioBatDau(nhanSu, ngay, gioBatDau);
    }

    @Override
    public List<LichLamViecResponseDTO> getNhanSuRanh(LocalDate ngay, Double gioBatDau) {
        log.info("Lấy danh sách nhân sự rảnh ngày {} lúc {}", ngay, gioBatDau);
        List<LichLamViec> list = lichLamViecRepository.findByNgayLam(ngay);
        return list.stream()
                .filter(l -> l.getGioBatDau().equals(gioBatDau) && Integer.valueOf(0).equals(l.getIsNghi()))
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LichLamViecResponseDTO updateLichLamViec(String maLlv, LichLamViecRequestDTO request) {
        log.info("Cập nhật lịch làm việc: {}", maLlv);

        LichLamViec entity = lichLamViecRepository.findById(maLlv)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch làm việc với mã: " + maLlv));

        if (!entity.getNgayLam().equals(request.getNgayLam())
                || !entity.getGioBatDau().equals(request.getGioBatDau())) {
            boolean isExist = lichLamViecRepository.existsByNhanSuAndNgayLamAndGioBatDau(
                    entity.getNhanSu(), request.getNgayLam(), request.getGioBatDau());
            if (isExist) {
                throw new BusinessRuleException(
                        "Nhân sự đã có lịch làm việc vào ngày " + request.getNgayLam() + " lúc "
                        + request.getGioBatDau() + "h");
            }
        }

        entity.setNgayLam(request.getNgayLam());
        entity.setGioBatDau(request.getGioBatDau());
        entity.setGioKetThuc(request.getGioKetThuc());
        entity.setIsNghi(request.getIsNghi() != null ? request.getIsNghi() : entity.getIsNghi());

        LichLamViec updated = lichLamViecRepository.save(entity);
        log.info("Đã cập nhật lịch làm việc: {}", maLlv);

        return convertToResponseDTO(updated);
    }

    @Override
    @Transactional
    public void deleteLichLamViec(String maLlv) {
        log.info("Xóa lịch làm việc: {}", maLlv);

        LichLamViec entity = lichLamViecRepository.findById(maLlv)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch làm việc với mã: " + maLlv));

        lichLamViecRepository.delete(entity);
        log.info("Đã xóa lịch làm việc: {}", maLlv);
    }

    // ==================== PRIVATE METHODS ====================
    private LichLamViecResponseDTO convertToResponseDTO(LichLamViec entity) {
        return LichLamViecResponseDTO.builder()
                .maLlv(entity.getMaLlv())
                .tenNhanSu(entity.getNhanSu().getHoTen())
                .chucVu(entity.getNhanSu().getChucVu() != null ? entity.getNhanSu().getChucVu().getTenCv() : null)
                .ngayLam(entity.getNgayLam())
                .gioBatDau(entity.getGioBatDau())
                .gioKetThuc(entity.getGioKetThuc())
                .isNghi(entity.getIsNghi())
                .build();
    }

    @Override
    public List<SlotTrongDto> getDanhSachSlotTrong(LocalDate ngay, String maNs) {
        List<LichLamViec> danhSachLich;
        if (ngay != null) {
            danhSachLich = lichLamViecRepository.findByIsNghiFalseAndNgayLam(ngay);
        } else {
            LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"));
            danhSachLich = lichLamViecRepository.findByIsNghiFalseAndNgayLamGreaterThanEqual(today);
        }

        if (maNs != null && !maNs.trim().isEmpty()) {
            danhSachLich = danhSachLich.stream()
                    .filter(llv -> llv.getNhanSu() != null && llv.getNhanSu().getMaNs().equals(maNs))
                    .collect(Collectors.toList());
        }

        List<LichHen> tatCaLichHen = lichHenRepository.findByTrangThaiNot(TrangThaiLichHen.DA_HUY);

        List<SlotTrongDto> result = new java.util.ArrayList<>();

        for (LichLamViec llv : danhSachLich) {
            if (llv.getNhanSu() == null || llv.getNhanSu().getIsDeleted() == 1) {
                continue;
            }
            double start = llv.getGioBatDau() != null ? llv.getGioBatDau() : 8.0;
            double end = llv.getGioKetThuc() != null ? llv.getGioKetThuc() : 17.0;
            
            // Loop from start to end in 30-minute (0.5 hour) increments
            for (double slotStart = start; slotStart < end; slotStart += 0.5) {
                // Skip lunch break: 12:00 to 13:30 (12.0 to 13.5)
                if (slotStart >= 12.0 && slotStart < 13.5) {
                    continue;
                }
                double currentSlotStart = slotStart;
                
                // Check if there is an active appointment at this exact slot start time
                boolean isBooked = tatCaLichHen.stream().anyMatch(lh -> {
                    if (lh.getNhanSu() == null || !lh.getNhanSu().getMaNs().equals(llv.getNhanSu().getMaNs())) {
                        return false;
                    }
                    if (lh.getGioHen() == null || !lh.getGioHen().toLocalDate().equals(llv.getNgayLam())) {
                        return false;
                    }
                    LocalTime lhTime = lh.getGioHen().toLocalTime();
                    double lhTimeDouble = lhTime.getHour() + (lhTime.getMinute() / 60.0);
                    // Match if appointment is at the exact slot start hour
                    return Math.abs(lhTimeDouble - currentSlotStart) < 0.01;
                });

                result.add(SlotTrongDto.builder()
                        .maNs(llv.getNhanSu().getMaNs())
                        .tenBacSi(llv.getNhanSu().getHoTen())
                        .ngayLam(llv.getNgayLam())
                        .gioBatDau(currentSlotStart)
                        .gioKetThuc(currentSlotStart + 0.5)
                        .trangThaiSlot(isBooked ? "Đã đặt" : "Còn trống")
                        .build());
            }
        }

        return result;
    }

    private String nextCode(String sequenceName, String prefix) {
        Number nextVal = (Number) entityManager
                .createNativeQuery("SELECT " + sequenceName + ".NEXTVAL FROM dual")
                .getSingleResult();
        return prefix + String.format("%06d", nextVal.longValue());
    }
}
