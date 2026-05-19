package com.kada.da.modules.inventory.controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.modules.inventory.dto.NhaCungCapRequestDTO;
import com.kada.da.modules.inventory.dto.NhaCungCapResponseDTO;
import com.kada.da.modules.inventory.service.NhaCungCapService;
import com.kada.da.modules.staff.dto.PageResponseDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/nha-cung-cap")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'THU_KHO')")
public class NhaCungCapController {

    private final NhaCungCapService nhaCungCapService;

    // 1. Thêm mới NCC
    @PostMapping
    public ResponseEntity<NhaCungCapResponseDTO> createNhaCungCap(
            @Valid @RequestBody NhaCungCapRequestDTO request) {
        log.info("API: Tạo nhà cung cấp mới - Tên: {}", request.getTenNcc());
        NhaCungCapResponseDTO response = nhaCungCapService.createNhaCungCap(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 2. Cập nhật NCC
    @PutMapping("/{maNcc}")
    public ResponseEntity<NhaCungCapResponseDTO> updateNhaCungCap(
            @PathVariable String maNcc,
            @Valid @RequestBody NhaCungCapRequestDTO request) {
        log.info("API: Cập nhật nhà cung cấp - Mã: {}", maNcc);
        NhaCungCapResponseDTO response = nhaCungCapService.updateNhaCungCap(maNcc, request);
        return ResponseEntity.ok(response);
    }

    // 3. Lấy chi tiết 1 NCC
    @GetMapping("/{maNcc}")
    public ResponseEntity<NhaCungCapResponseDTO> getNhaCungCapById(@PathVariable String maNcc) {
        log.info("API: Lấy chi tiết nhà cung cấp - Mã: {}", maNcc);
        NhaCungCapResponseDTO response = nhaCungCapService.getNhaCungCapById(maNcc);
        return ResponseEntity.ok(response);
    }

    // 4. Lấy danh sách NCC (có phân trang và tìm kiếm)
    @GetMapping
    public ResponseEntity<PageResponseDTO<NhaCungCapResponseDTO>> getAllNhaCungCap(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        log.info("API: Lấy danh sách nhà cung cấp - Page: {}, Size: {}, Keyword: {}", page, size, keyword);
        PageResponseDTO<NhaCungCapResponseDTO> response = nhaCungCapService.getAllNhaCungCap(page, size, keyword);
        return ResponseEntity.ok(response);
    }

    // 5. Xóa NCC
    @DeleteMapping("/{maNcc}")
    public ResponseEntity<Void> deleteNhaCungCap(@PathVariable String maNcc) {
        log.info("API: Xóa nhà cung cấp - Mã: {}", maNcc);
        nhaCungCapService.deleteNhaCungCap(maNcc);
        return ResponseEntity.noContent().build();
    }
}
