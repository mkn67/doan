package com.kada.da.Service.impl;

import com.kada.da.Dto.GoiKhamRequestDTO;
import com.kada.da.Dto.Response.GoiKhamResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Entity.GoiKham;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.Repository.GoiKhamRepository;
import com.kada.da.Service.GoiKhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

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
    public GoiKhamResponseDTO getGoiKhamById(String maGoi) {
        GoiKham goiKham = goiKhamRepository.findById(maGoi)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gói khám: " + maGoi));
        return mapToResponse(goiKham);
    }

    @Override
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

    private GoiKhamResponseDTO mapToResponse(GoiKham entity) {
        if (entity == null)
            return null;

        return GoiKhamResponseDTO.builder()
                .maGoi(entity.getMaGoi())
                .tenGoi(entity.getTenGoi())
                .giaGoi(entity.getGia())
                .moTa("Thời lượng dự kiến: " + entity.getThoiLuong() + " phút")
                .build();
    }
}