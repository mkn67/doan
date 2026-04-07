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

    private static final String PREFIX = "LLV";

    @Override
    @Transactional
    public LichLamViecResponseDTO createLichLamViec(LichLamViecRequestDTO request) {
        log.info("Tạo lịch làm việc cho nhân sự: {}, ngày: {}, ca: {}",
                request.getMaNs(), request.getNgay(), request.getCa());

        // Kiểm tra nhân sự tồn tại
        NhanSu nhanSu = nhanSuRepository.findById(request.getMaNs())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân sự không tồn tại: " + request.getMaNs()));

        // Kiểm tra trùng lịch (cùng ngày, cùng ca)
        boolean isExist = lichLamViecRepository.existsByNhanSuAndNgayLamViecAndCa(nhanSu, request.getNgay(),
                request.getCa());
        if (isExist) {
            throw new BusinessRuleException(
                    "Nhân sự đã có lịch làm việc vào ngày " + request.getNgay() + " ca " + request.getCa());
        }

        // Tạo mã tự động
        String maLlv = generateMaLichLamViec();

        LichLamViec lichLamViec = LichLamViec.builder()
                .maLlv(maLlv)
                .nhanSu(nhanSu)
                .ngayLamViec(request.getNgay())
                .ca(request.getCa())
                .build();

        LichLamViec saved = lichLamViecRepository.save(lichLamViec);
        log.info("Đã tạo lịch làm việc với mã: {}", maLlv);

        return convertToResponseDTO(saved);
    }

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

        List<LichLamViec> list = lichLamViecRepository.findByNhanSuOrderByNgayLamViecAsc(nhanSu);
        return list.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<LichLamViecResponseDTO> getLichLamViecByNhanSuAndDateRange(String maNs, LocalDate fromDate,
            LocalDate toDate) {
        log.info("Lấy lịch làm việc theo nhân sự {} từ {} đến {}", maNs, fromDate, toDate);

        NhanSu nhanSu = nhanSuRepository.findById(maNs)
                .orElseThrow(() -> new ResourceNotFoundException("Nhân sự không tồn tại: " + maNs));

        List<LichLamViec> list = lichLamViecRepository.findByNhanSuAndNgayLamViecBetween(nhanSu, fromDate, toDate);
        return list.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<LichLamViecResponseDTO> getLichLamViecByNgay(LocalDate ngay) {
        log.info("Lấy lịch làm việc theo ngày: {}", ngay);
        List<LichLamViec> list = lichLamViecRepository.findByNgayLamViec(ngay);
        return list.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<LichLamViecResponseDTO> getLichLamViecByCa(String ca) {
        log.info("Lấy lịch làm việc theo ca: {}", ca);
        List<LichLamViec> list = lichLamViecRepository.findByCa(ca);
        return list.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public boolean isNhanSuRanh(String maNs, LocalDate ngay, String ca) {
        log.info("Kiểm tra nhân sự {} rảnh ngày {} ca {}", maNs, ngay, ca);

        NhanSu nhanSu = nhanSuRepository.findById(maNs)
                .orElseThrow(() -> new ResourceNotFoundException("Nhân sự không tồn tại: " + maNs));

        return !lichLamViecRepository.existsByNhanSuAndNgayLamViecAndCa(nhanSu, ngay, ca);
    }

    @Override
    public List<LichLamViecResponseDTO> getNhanSuRanh(LocalDate ngay, String ca) {
        log.info("Lấy danh sách nhân sự rảnh ngày {} ca {}", ngay, ca);
        List<LichLamViec> list = lichLamViecRepository.findByNgayLamViec(ngay);
        return list.stream().filter(l -> l.getCa().equals(ca)).map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LichLamViecResponseDTO updateLichLamViec(String maLlv, LichLamViecRequestDTO request) {
        log.info("Cập nhật lịch làm việc: {}", maLlv);

        LichLamViec entity = lichLamViecRepository.findById(maLlv)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch làm việc với mã: " + maLlv));

        // Nếu thay đổi ngày hoặc ca, kiểm tra trùng
        if (!entity.getNgayLamViec().equals(request.getNgay()) || !entity.getCa().equals(request.getCa())) {
            boolean isExist = lichLamViecRepository.existsByNhanSuAndNgayLamViecAndCa(
                    entity.getNhanSu(), request.getNgay(), request.getCa());
            if (isExist) {
                throw new BusinessRuleException(
                        "Nhân sự đã có lịch làm việc vào ngày " + request.getNgay() + " ca " + request.getCa());
            }
        }

        entity.setNgayLamViec(request.getNgay());
        entity.setCa(request.getCa());

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

    @Override
    @Transactional
    public List<LichLamViecResponseDTO> createLichLamViecBatch(List<LichLamViecRequestDTO> requests) {
        log.info("Tạo hàng loạt {} lịch làm việc", requests.size());
        return requests.stream()
                .map(this::createLichLamViec)
                .collect(Collectors.toList());
    }

    // ==================== PRIVATE METHODS ====================

    private String generateMaLichLamViec() {
        String maxCode = lichLamViecRepository.findMaxMaLlv();
        if (maxCode == null || maxCode.length() < 4) {
            return PREFIX + "001";
        }
        String numberPart = maxCode.substring(PREFIX.length());
        try {
            int nextNumber = Integer.parseInt(numberPart) + 1;
            return PREFIX + String.format("%03d", nextNumber);
        } catch (NumberFormatException e) {
            return PREFIX + "001";
        }
    }

    private LichLamViecResponseDTO convertToResponseDTO(LichLamViec entity) {
        return LichLamViecResponseDTO.builder()
                .maLlv(entity.getMaLlv())
                .tenNhanSu(entity.getNhanSu().getHoTen()) // Lấy tên nhân sự
                .chucVu(entity.getNhanSu().getChucVu() != null ? entity.getNhanSu().getChucVu().getTenCv() : null) // Lấy
                                                                                                                   // tên
                                                                                                                   // chức
                                                                                                                   // vụ
                .ngay(entity.getNgayLamViec())
                .ca(entity.getCa())
                .trangThai(null) // Hoặc set nếu có field tương ứng trong entity
                .ghiChu(null) // Hoặc set nếu có field tương ứng trong entity
                .build();
    }
}