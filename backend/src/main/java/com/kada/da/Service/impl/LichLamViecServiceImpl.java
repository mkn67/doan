package com.kada.da.Service.impl;

import com.kada.da.Dto.LichLamViecRequestDTO;
import com.kada.da.Dto.Response.LichLamViecResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Entity.LichLamViec;
import com.kada.da.Entity.NhanSu;
import com.kada.da.Exception.BusinessRuleException;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.Repository.LichLamViecRepository;
import com.kada.da.Repository.NhanSuRepository;
import com.kada.da.Service.LichLamViecService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LichLamViecServiceImpl implements LichLamViecService {

    private final LichLamViecRepository lichLamViecRepository;
    private final NhanSuRepository nhanSuRepository;

    // =========================================================
    // 1. TẠO LỊCH BẰNG STORED PROCEDURE (MỚI)
    // =========================================================
    @Override
    @Transactional
    public void taoLichLamViec(LichLamViecRequestDTO request) {
        log.info("Gọi SP_TAO_LICH_LAM_VIEC cho nhân sự: {}, ngày: {}, giờ: {}",
                request.getMaNs(), request.getNgayLam(), request.getGioBatDau());

        // Mọi logic validate trùng giờ, nghỉ việc... Oracle sẽ tự ném Exception ra!
        lichLamViecRepository.taoLichLamViec(
                request.getMaNs(),
                request.getNgayLam(),
                request.getGioBatDau(),
                request.getGioKetThuc(),
                request.getIsNghi() != null ? request.getIsNghi() : 0);
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
                .filter(l -> l.getGioBatDau().equals(gioBatDau) && l.getIsNghi() == 0)
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
}