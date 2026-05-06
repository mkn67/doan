package com.kada.da.modules.staff.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping; // Tự tạo file Service tương ứng nhé
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.modules.staff.dto.NhanSuRequestDTO;
import com.kada.da.modules.staff.dto.NhanSuResponseDTO;
import com.kada.da.modules.staff.dto.PageResponseDTO;
import com.kada.da.modules.report.dto.TopBacSiDTO;
import com.kada.da.modules.staff.service.NhanSuService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/nhan-su")
@RequiredArgsConstructor
public class NhanSuController {

    private final NhanSuService nhanSuService;

    @PostMapping
    public ResponseEntity<NhanSuResponseDTO> createNhanSu(@Valid @RequestBody NhanSuRequestDTO request) {
        return new ResponseEntity<>(nhanSuService.createNhanSu(request), HttpStatus.CREATED);
    }

    @PutMapping("/{maNs}")
    public ResponseEntity<NhanSuResponseDTO> updateNhanSu(@PathVariable String maNs,
            @Valid @RequestBody NhanSuRequestDTO request) {
        return ResponseEntity.ok(nhanSuService.updateNhanSu(maNs, request));
    }

    @GetMapping("/{maNs}")
    public ResponseEntity<NhanSuResponseDTO> getNhanSuById(@PathVariable String maNs) {
        return ResponseEntity.ok(nhanSuService.getNhanSuById(maNs));
    }

    @GetMapping
    public ResponseEntity<PageResponseDTO<NhanSuResponseDTO>> getAllNhanSu(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(nhanSuService.getAllNhanSu(page, size, keyword));
    }

    @GetMapping("/top-rating")
    public ResponseEntity<List<TopBacSiDTO>> getTopBacSiRating() {
        // Viết ngắn gọn thế này thôi, Spring Boot nó đủ thông minh để tự hiểu!
        return ResponseEntity.ok(nhanSuService.getTopBacSiRating());
    }
}