package com.kada.da.Service.impl;

import com.kada.da.Dto.DichVuKhamRequestDTO;
import com.kada.da.Dto.Response.DichVuKhamResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Entity.DichVuKham;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.Repository.DichVuKhamRepository;
import com.kada.da.Service.DichVuKhamService;
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
public class DichVuKhamServiceImpl implements DichVuKhamService {

    private final DichVuKhamRepository dichVuKhamRepository;

    @Override
    @Transactional
    public DichVuKhamResponseDTO createDichVu(DichVuKhamRequestDTO request) {
        DichVuKham dichVu = new DichVuKham();
        dichVu.setMaDv("DV" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        dichVu.setTenDv(request.getTenDv());

        // SỬA: Dùng setGia() theo đúng Entity
        dichVu.setGia(request.getGiaDv());
        dichVu.setMoTa(request.getMoTa());

        // BỔ SUNG: Mặc định tạo mới là đang hoạt động
        dichVu.setIsActive(1);

        DichVuKham saved = dichVuKhamRepository.save(dichVu);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public DichVuKhamResponseDTO updateDichVu(String maDv, DichVuKhamRequestDTO request) {
        DichVuKham dichVu = dichVuKhamRepository.findById(maDv)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dịch vụ: " + maDv));

        dichVu.setTenDv(request.getTenDv());

        // SỬA: Dùng setGia()
        dichVu.setGia(request.getGiaDv());
        dichVu.setMoTa(request.getMoTa());

        DichVuKham updated = dichVuKhamRepository.save(dichVu);
        return mapToResponse(updated);
    }

    @Override
    public PageResponseDTO<DichVuKhamResponseDTO> getAllDichVu(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        // LƯU Ý MỞ RỘNG: Thường thì getAll chỉ lấy những dịch vụ đang Active.
        // Nếu sau này ông viết thêm hàm findByIsActive(1, pageable) trong Repository
        // thì thay vào đây là điểm 10 tuyệt đối luôn!
        Page<DichVuKham> dichVuPage = dichVuKhamRepository.findAll(pageable);

        return PageResponseDTO.<DichVuKhamResponseDTO>builder()
                .content(dichVuPage.getContent().stream().map(this::mapToResponse).collect(Collectors.toList()))
                .pageNo(dichVuPage.getNumber())
                .pageSize(dichVuPage.getSize())
                .totalElements(dichVuPage.getTotalElements())
                .totalPages(dichVuPage.getTotalPages())
                .last(dichVuPage.isLast())
                .build();
    }

    private DichVuKhamResponseDTO mapToResponse(DichVuKham entity) {
        return DichVuKhamResponseDTO.builder()
                .maDv(entity.getMaDv())
                .tenDv(entity.getTenDv())

                // SỬA: Dùng getGia() từ Entity để map sang giaDv của DTO
                .giaDv(entity.getGia())
                .moTa(entity.getMoTa())
                // .isActive(entity.getIsActive()) // Bật lên nếu DTO của ông có trường này
                .build();
    }
}