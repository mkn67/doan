package com.kada.da.Controller;

import com.kada.da.Dto.NhaCungCapRequestDTO;
import com.kada.da.Dto.Response.NhaCungCapResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Service.NhaCungCapService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/nha-cung-cap")
@RequiredArgsConstructor
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
}