package com.kada.da.modules.inventory.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.modules.inventory.domain.SanPham;
import com.kada.da.modules.inventory.domain.LoaiSanPham;
import com.kada.da.modules.inventory.dto.SanPhamRequestDTO;
import com.kada.da.modules.inventory.dto.SanPhamResponseDTO;
import com.kada.da.modules.inventory.mapper.SanPhamMapper;
import com.kada.da.modules.inventory.repository.LoaiSanPhamRepository;
import com.kada.da.modules.inventory.service.SanPhamService;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/san-pham")
@PreAuthorize("hasAnyRole('ADMIN', 'THU_KHO', 'BAC_SI')")
@RequiredArgsConstructor
@Transactional
public class SanPhamController {

    private final SanPhamService sanPhamService;
    private final LoaiSanPhamRepository loaiSanPhamRepository;

    // Helper method to map SanPham entity to SanPhamResponseDTO and calculate dynamic fields
    private SanPhamResponseDTO mapToResponseDTO(SanPham entity) {
        SanPhamResponseDTO dto = SanPhamMapper.toResponse(entity);
        if (dto != null) {
            int tongTon = 0;
            if (entity.getDanhSachLoHang() != null) {
                tongTon = entity.getDanhSachLoHang().stream()
                        .mapToInt(lh -> lh.getSoLuongTon() != null ? lh.getSoLuongTon() : 0)
                        .sum();
            }
            dto.setTongTonKho(tongTon);
            dto.setTrangThai(tongTon > 0 ? "Còn hàng" : "Hết hàng");
        }
        return dto;
    }

    // 1. Lấy danh sách tất cả sản phẩm
    @GetMapping
    public ResponseEntity<List<SanPhamResponseDTO>> getAllSanPham() {
        List<SanPhamResponseDTO> dtos = sanPhamService.getAllSanPham().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // 2. Lấy danh sách CHỈ là thuốc (phục vụ cho việc Kê đơn)
    @GetMapping("/thuoc")
    public ResponseEntity<List<SanPhamResponseDTO>> getDanhSachThuoc() {
        List<SanPhamResponseDTO> dtos = sanPhamService.getDanhSachThuoc().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // 3. Lấy 1 sản phẩm theo mã
    @GetMapping("/{maSp}")
    public ResponseEntity<SanPhamResponseDTO> getSanPhamById(@PathVariable String maSp) {
        SanPham entity = sanPhamService.getSanPhamById(maSp);
        return ResponseEntity.ok(mapToResponseDTO(entity));
    }

    // 4. Tạo mới sản phẩm
    @PostMapping
    public ResponseEntity<SanPhamResponseDTO> createSanPham(@RequestBody SanPhamRequestDTO dto) {
        SanPham sanPham = SanPham.builder()
                .tenSp(dto.getTenSp())
                .giaBan(dto.getGiaBan())
                .laThuoc(dto.getLaThuoc() != null && dto.getLaThuoc() ? 1 : 0)
                .tonKhoToiThieu(10) // Mức cảnh báo mặc định
                .donViTinh(dto.getLaThuoc() != null && dto.getLaThuoc() ? "Lọ" : "Cái")
                .donViTinhKho(dto.getLaThuoc() != null && dto.getLaThuoc() ? "Lọ" : "Cái")
                .build();

        if (dto.getMaLoai() != null) {
            LoaiSanPham loai = loaiSanPhamRepository.findById(dto.getMaLoai()).orElse(null);
            sanPham.setLoaiSanPham(loai);
        }

        SanPham saved = sanPhamService.createSanPham(sanPham);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponseDTO(saved));
    }

    // 5. Cập nhật sản phẩm
    @PutMapping("/{maSp}")
    public ResponseEntity<SanPhamResponseDTO> updateSanPham(@PathVariable String maSp, @RequestBody SanPhamRequestDTO dto) {
        SanPham sanPham = SanPham.builder()
                .tenSp(dto.getTenSp())
                .giaBan(dto.getGiaBan())
                .laThuoc(dto.getLaThuoc() != null && dto.getLaThuoc() ? 1 : 0)
                .tonKhoToiThieu(10)
                .donViTinh(dto.getLaThuoc() != null && dto.getLaThuoc() ? "Lọ" : "Cái")
                .donViTinhKho(dto.getLaThuoc() != null && dto.getLaThuoc() ? "Lọ" : "Cái")
                .build();

        if (dto.getMaLoai() != null) {
            LoaiSanPham loai = loaiSanPhamRepository.findById(dto.getMaLoai()).orElse(null);
            sanPham.setLoaiSanPham(loai);
        }

        SanPham updated = sanPhamService.updateSanPham(maSp, sanPham);
        return ResponseEntity.ok(mapToResponseDTO(updated));
    }

    // 6. Xóa sản phẩm
    @DeleteMapping("/{maSp}")
    public ResponseEntity<Void> deleteSanPham(@PathVariable String maSp) {
        sanPhamService.deleteSanPham(maSp);
        return ResponseEntity.noContent().build();
    }

    // 7. Lấy danh sách tất cả loại sản phẩm (dùng cho dropdown phía Frontend)
    @GetMapping("/categories")
    public ResponseEntity<List<LoaiSanPham>> getAllCategories() {
        return ResponseEntity.ok(loaiSanPhamRepository.findAll());
    }
}
