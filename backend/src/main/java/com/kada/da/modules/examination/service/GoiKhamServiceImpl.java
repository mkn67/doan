package com.kada.da.modules.examination.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.modules.examination.domain.GoiKham;
import com.kada.da.modules.examination.dto.GoiKhamRequestDTO;
import com.kada.da.modules.examination.dto.GoiKhamResponseDTO;
import com.kada.da.modules.examination.repository.GoiKhamRepository;
import com.kada.da.modules.staff.dto.PageResponseDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GoiKhamServiceImpl implements GoiKhamService {

    private final GoiKhamRepository goiKhamRepository;

    @Override
    @Transactional
    public GoiKhamResponseDTO createGoiKham(GoiKhamRequestDTO request) {
        GoiKham goiKham = GoiKham.builder()
                .maGoi("GK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .tenGoi(request.getTenGoi())
                .gia(request.getGiaGoi())
                .thoiLuong(60) // Mặc định 60 phút hoặc lấy từ request nếu có
                .build();

        GoiKham saved = goiKhamRepository.save(goiKham);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public GoiKhamResponseDTO getGoiKhamById(String maGoi) {
        GoiKham goiKham = goiKhamRepository.findById(maGoi)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gói khám: " + maGoi));
        return mapToResponse(goiKham);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<GoiKhamResponseDTO> getAllGoiKham(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<GoiKham> goiKhamPage = goiKhamRepository.findAll(pageable);

        return PageResponseDTO.<GoiKhamResponseDTO>builder()
                .content(goiKhamPage.getContent().stream()
                        .map(this::mapToResponse)
                        .collect(Collectors.toList()))
                .pageNo(goiKhamPage.getNumber())
                .pageSize(goiKhamPage.getSize())
                .totalElements(goiKhamPage.getTotalElements())
                .totalPages(goiKhamPage.getTotalPages())
                .last(goiKhamPage.isLast())
                .build();
    }

    @Override
    public List<GoiKhamResponseDTO> getActiveGoiKham() {
        // Truyền số 1 vào để chỉ lấy các gói khám đang hoạt động
        return goiKhamRepository.findByIsActive(1).stream()
                .map(this::mapToResponse) // Giả định m đã có sẵn hàm mapToResponse trong file này rồi
                .collect(Collectors.toList());
    }

    private GoiKhamResponseDTO mapToResponse(GoiKham entity) {
        if (entity == null) {
            return null;
        }

        return GoiKhamResponseDTO.builder()
                .maGoi(entity.getMaGoi())
                .tenGoi(entity.getTenGoi())
                .giaGoi(entity.getGia())
                .moTa("Thời lượng dự kiến: " + entity.getThoiLuong() + " phút")
                .build();
    }
}
