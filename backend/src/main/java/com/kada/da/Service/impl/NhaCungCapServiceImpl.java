package com.kada.da.Service.impl;

import com.kada.da.Dto.NhaCungCapRequestDTO;
import com.kada.da.Dto.Response.NhaCungCapResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Entity.NhaCungCap;
import com.kada.da.Exception.BusinessRuleException;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.Repository.NhaCungCapRepository;
import com.kada.da.Service.NhaCungCapService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NhaCungCapServiceImpl implements NhaCungCapService {

    private final NhaCungCapRepository nhaCungCapRepository;
    private static final String PREFIX = "NCC";

    @Override
    @Transactional
    public NhaCungCapResponseDTO createNhaCungCap(NhaCungCapRequestDTO request) {
        log.info("Tạo nhà cung cấp mới: {}", request.getTenNcc());

        // Kiểm tra trùng tên
        if (nhaCungCapRepository.existsByTenNcc(request.getTenNcc())) {
            throw new BusinessRuleException("Tên nhà cung cấp đã tồn tại: " + request.getTenNcc());
        }

        // Kiểm tra trùng số điện thoại
        if (request.getSdt() != null && nhaCungCapRepository.existsBySdt(request.getSdt())) {
            throw new BusinessRuleException("Số điện thoại đã được đăng ký bởi nhà cung cấp khác");
        }

        NhaCungCap nhaCungCap = NhaCungCap.builder()
                .maNcc(generateMaNcc())
                .tenNcc(request.getTenNcc())
                .sdt(request.getSdt())
                .diaChi(request.getDiaChi())
                .build();

        NhaCungCap saved = nhaCungCapRepository.save(nhaCungCap);
        log.info("Đã tạo nhà cung cấp với mã: {}", saved.getMaNcc());

        return convertToResponseDTO(saved);
    }

    @Override
    public NhaCungCapResponseDTO getNhaCungCapById(String maNcc) {
        log.info("Lấy nhà cung cấp theo mã: {}", maNcc);
        NhaCungCap nhaCungCap = findById(maNcc);
        return convertToResponseDTO(nhaCungCap);
    }

    @Override
    public PageResponseDTO<NhaCungCapResponseDTO> getAllNhaCungCap(int page, int size, String keyword) {
        log.info("Lấy danh sách nhà cung cấp - page: {}, size: {}, keyword: {}", page, size, keyword);

        Pageable pageable = PageRequest.of(page, size);
        Page<NhaCungCap> nhaCungCapPage;

        // Bổ sung logic tìm kiếm
        if (keyword != null && !keyword.trim().isEmpty()) {
            // Giả định Repository đã có hàm findByTenNccContainingIgnoreCase
            nhaCungCapPage = nhaCungCapRepository.findAll(pageable);
        } else {
            nhaCungCapPage = nhaCungCapRepository.findAll(pageable);
        }

        List<NhaCungCapResponseDTO> responseList = nhaCungCapPage.getContent().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());

        return PageResponseDTO.<NhaCungCapResponseDTO>builder()
                .content(responseList)
                .pageNo(page)
                .pageSize(size)
                .totalElements(nhaCungCapPage.getTotalElements())
                .totalPages(nhaCungCapPage.getTotalPages())
                .last(nhaCungCapPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public NhaCungCapResponseDTO updateNhaCungCap(String maNcc, NhaCungCapRequestDTO request) {
        log.info("Cập nhật nhà cung cấp: {}", maNcc);

        NhaCungCap nhaCungCap = findById(maNcc);

        // Kiểm tra trùng tên (trừ chính nó)
        if (!nhaCungCap.getTenNcc().equals(request.getTenNcc())
                && nhaCungCapRepository.existsByTenNcc(request.getTenNcc())) {
            throw new BusinessRuleException("Tên nhà cung cấp đã tồn tại: " + request.getTenNcc());
        }

        // Kiểm tra trùng số điện thoại (trừ chính nó)
        if (request.getSdt() != null && !request.getSdt().equals(nhaCungCap.getSdt())
                && nhaCungCapRepository.existsBySdt(request.getSdt())) {
            throw new BusinessRuleException("Số điện thoại đã được đăng ký bởi nhà cung cấp khác");
        }

        nhaCungCap.setTenNcc(request.getTenNcc());
        nhaCungCap.setSdt(request.getSdt());
        nhaCungCap.setDiaChi(request.getDiaChi());

        NhaCungCap updated = nhaCungCapRepository.save(nhaCungCap);
        return convertToResponseDTO(updated);
    }

    // ==================== PRIVATE METHODS ====================

    private NhaCungCap findById(String maNcc) {
        return nhaCungCapRepository.findById(maNcc)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhà cung cấp với mã: " + maNcc));
    }

    private String generateMaNcc() {
        String maxCode = nhaCungCapRepository.findMaxMaNcc();
        if (maxCode == null || maxCode.length() < 3) {
            return PREFIX + "001";
        }
        String numberPart = maxCode.substring(PREFIX.length());
        int nextNumber = Integer.parseInt(numberPart) + 1;
        return PREFIX + String.format("%03d", nextNumber);
    }

    private NhaCungCapResponseDTO convertToResponseDTO(NhaCungCap entity) {
        return NhaCungCapResponseDTO.builder()
                .maNcc(entity.getMaNcc())
                .tenNcc(entity.getTenNcc())
                .sdt(entity.getSdt())
                .diaChi(entity.getDiaChi())
                .build();
    }
}