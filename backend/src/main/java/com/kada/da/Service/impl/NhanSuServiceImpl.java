package com.kada.da.Service.impl;

import com.kada.da.Dto.NhanSuRequestDTO;
import com.kada.da.Dto.Response.NhanSuResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Entity.ChucVu;
import com.kada.da.Entity.NhanSu;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.Repository.ChucVuRepository;
import com.kada.da.Repository.NhanSuRepository;
import com.kada.da.Service.NhanSuService;
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
public class NhanSuServiceImpl implements NhanSuService {

    private final NhanSuRepository nhanSuRepository;
    private final ChucVuRepository chucVuRepository;

    @Override
    @Transactional
    public NhanSuResponseDTO createNhanSu(NhanSuRequestDTO request) {
        ChucVu chucVu = chucVuRepository.findById(request.getMaChucVu())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chức vụ: " + request.getMaChucVu()));

        NhanSu nhanSu = NhanSu.builder()
                .maNs("NS" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .hoTen(request.getHoTen())
                .sdt(request.getSdt())
                .cccd(request.getDiaChi()) // Giả định mapping từ request
                .ngaySinh(request.getNgaySinh())
                .gioiTinh(request.getGioiTinh())
                .diaChi(request.getDiaChi())
                .chucVu(chucVu)
                .isDeleted(0)
                .build();

        return mapToResponse(nhanSuRepository.save(nhanSu));
    }

    @Override
    @Transactional
    public NhanSuResponseDTO updateNhanSu(String maNs, NhanSuRequestDTO request) {
        NhanSu nhanSu = nhanSuRepository.findById(maNs)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân sự: " + maNs));

        ChucVu chucVu = chucVuRepository.findById(request.getMaChucVu())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chức vụ: " + request.getMaChucVu()));

        nhanSu.setHoTen(request.getHoTen());
        nhanSu.setSdt(request.getSdt());
        nhanSu.setNgaySinh(request.getNgaySinh());
        nhanSu.setGioiTinh(request.getGioiTinh());
        nhanSu.setDiaChi(request.getDiaChi());
        nhanSu.setChucVu(chucVu);

        return mapToResponse(nhanSuRepository.save(nhanSu));
    }

    @Override
    public NhanSuResponseDTO getNhanSuById(String maNs) {
        return nhanSuRepository.findById(maNs)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân sự: " + maNs));
    }

    @Override
    public PageResponseDTO<NhanSuResponseDTO> getAllNhanSu(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NhanSu> nhanSuPage = (keyword == null || keyword.isEmpty())
                ? nhanSuRepository.findAll(pageable)
                : nhanSuRepository.findByHoTenContainingIgnoreCase(keyword, pageable);

        return PageResponseDTO.<NhanSuResponseDTO>builder()
                .content(nhanSuPage.getContent().stream().map(this::mapToResponse).collect(Collectors.toList()))
                .pageNo(nhanSuPage.getNumber())
                .pageSize(nhanSuPage.getSize())
                .totalElements(nhanSuPage.getTotalElements())
                .totalPages(nhanSuPage.getTotalPages())
                .last(nhanSuPage.isLast())
                .build();
    }

    private NhanSuResponseDTO mapToResponse(NhanSu entity) {
        return NhanSuResponseDTO.builder()
                .maNs(entity.getMaNs())
                .hoTen(entity.getHoTen())
                .sdt(entity.getSdt())
                .diaChi(entity.getDiaChi())
                .ngaySinh(entity.getNgaySinh())
                .gioiTinh(entity.getGioiTinh())
                .tenChucVu(entity.getChucVu() != null ? entity.getChucVu().getTenCv() : null)
                .build();
    }
}