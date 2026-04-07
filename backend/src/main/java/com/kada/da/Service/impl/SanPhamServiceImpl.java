package com.kada.da.Service.impl;

import com.kada.da.Dto.SanPhamRequestDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Dto.Response.SanPhamResponseDTO;
import com.kada.da.Entity.LoaiSanPham;
import com.kada.da.Entity.SanPham;
import com.kada.da.Enum.TrangThaiSanPham;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.Repository.LoaiSanPhamRepository;
import com.kada.da.Repository.SanPhamRepository;
import com.kada.da.Service.SanPhamService;
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
public class SanPhamServiceImpl implements SanPhamService {

    private final SanPhamRepository sanPhamRepository;
    private final LoaiSanPhamRepository loaiSanPhamRepository;

    @Override
    @Transactional
    public SanPhamResponseDTO createSanPham(SanPhamRequestDTO request) {
        LoaiSanPham loai = loaiSanPhamRepository.findById(request.getMaLoai())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Không tìm thấy loại sản phẩm: " + request.getMaLoai()));

        SanPham sanPham = SanPham.builder()
                .maSp("SP" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .tenSp(request.getTenSp())
                .giaBan(request.getGiaBan())
                .laThuoc(request.getLaThuoc() ? 1 : 0)
                .loaiSanPham(loai)
                .trangThai(TrangThaiSanPham.DANG_BAN)
                .build();

        return mapToResponse(sanPhamRepository.save(sanPham));
    }

    @Override
    @Transactional
    public SanPhamResponseDTO updateSanPham(String maSp, SanPhamRequestDTO request) {
        SanPham sanPham = sanPhamRepository.findById(maSp)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm: " + maSp));

        LoaiSanPham loai = loaiSanPhamRepository.findById(request.getMaLoai())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Không tìm thấy loại sản phẩm: " + request.getMaLoai()));

        sanPham.setTenSp(request.getTenSp());
        sanPham.setGiaBan(request.getGiaBan());
        sanPham.setLaThuoc(request.getLaThuoc() ? 1 : 0);
        sanPham.setLoaiSanPham(loai);

        return mapToResponse(sanPhamRepository.save(sanPham));
    }

    @Override
    public SanPhamResponseDTO getSanPhamById(String maSp) {
        return sanPhamRepository.findById(maSp)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm: " + maSp));
    }

    @Override
    public PageResponseDTO<SanPhamResponseDTO> getAllSanPham(int page, int size, Boolean laThuoc, String keyword) {
        Pageable pageable = PageRequest.of(page, size);
        // Lưu ý: Cần bổ sung Query Method trong SanPhamRepository để hỗ trợ filter nâng
        // cao nếu cần
        Page<SanPham> sanPhamPage = sanPhamRepository.findAll(pageable);

        return PageResponseDTO.<SanPhamResponseDTO>builder()
                .content(sanPhamPage.getContent().stream()
                        .map(this::mapToResponse)
                        .collect(Collectors.toList()))
                .pageNo(sanPhamPage.getNumber())
                .pageSize(sanPhamPage.getSize())
                .totalElements(sanPhamPage.getTotalElements())
                .totalPages(sanPhamPage.getTotalPages())
                .last(sanPhamPage.isLast())
                .build();
    }

    private SanPhamResponseDTO mapToResponse(SanPham entity) {
        if (entity == null)
            return null;

        return SanPhamResponseDTO.builder()
                .maSp(entity.getMaSp())
                .tenSp(entity.getTenSp())
                .tenLoai(entity.getLoaiSanPham() != null ? entity.getLoaiSanPham().getTenLoai() : null)
                .giaBan(entity.getGiaBan())
                .laThuoc(entity.getLaThuoc() != null && entity.getLaThuoc() == 1)
                .trangThai(entity.getTrangThai() != null ? entity.getTrangThai().name() : null)
                // Các trường khác như tongTonKho, tenNhaCungCap có thể tính toán thêm từ LoHang
                .build();
    }
}