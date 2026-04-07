package com.kada.da.Controller;

import com.kada.da.Dto.SanPhamRequestDTO;
import com.kada.da.Dto.Response.SanPhamResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Service.SanPhamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/san-pham")
@RequiredArgsConstructor
public class SanPhamController {

    private final SanPhamService sanPhamService;

    @PostMapping
    public ResponseEntity<SanPhamResponseDTO> createSanPham(@Valid @RequestBody SanPhamRequestDTO request) {
        return new ResponseEntity<>(sanPhamService.createSanPham(request), HttpStatus.CREATED);
    }

    @PutMapping("/{maSp}")
    public ResponseEntity<SanPhamResponseDTO> updateSanPham(@PathVariable String maSp,
            @Valid @RequestBody SanPhamRequestDTO request) {
        return ResponseEntity.ok(sanPhamService.updateSanPham(maSp, request));
    }

    @GetMapping("/{maSp}")
    public ResponseEntity<SanPhamResponseDTO> getSanPhamById(@PathVariable String maSp) {
        return ResponseEntity.ok(sanPhamService.getSanPhamById(maSp));
    }

    @GetMapping
    public ResponseEntity<PageResponseDTO<SanPhamResponseDTO>> getAllSanPham(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) Boolean laThuoc, // Lọc riêng thuốc hoặc kính
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(sanPhamService.getAllSanPham(page, size, laThuoc, keyword));
    }
}