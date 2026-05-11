package com.kada.da.modules.examination.controller;

import com.kada.da.modules.examination.dto.GoiKhamRequestDTO;
import com.kada.da.modules.examination.dto.GoiKhamResponseDTO;
import com.kada.da.modules.staff.dto.PageResponseDTO;
import com.kada.da.modules.examination.service.GoiKhamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/goi-kham")
@RequiredArgsConstructor
public class GoiKhamController {

    private final GoiKhamService goiKhamService;

    @PostMapping
    public ResponseEntity<GoiKhamResponseDTO> createGoiKham(@Valid @RequestBody GoiKhamRequestDTO request) {
        return new ResponseEntity<>(goiKhamService.createGoiKham(request), HttpStatus.CREATED);
    }

    @GetMapping("/{maGoi}")
    public ResponseEntity<GoiKhamResponseDTO> getGoiKhamById(@PathVariable String maGoi) {
        return ResponseEntity.ok(goiKhamService.getGoiKhamById(maGoi));
    }

    @GetMapping
    public ResponseEntity<PageResponseDTO<GoiKhamResponseDTO>> getAllGoiKham(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(goiKhamService.getAllGoiKham(page, size));
    }

    @GetMapping("/active")
    public ResponseEntity<List<GoiKhamResponseDTO>> getActiveGoiKham() {
        return ResponseEntity.ok(goiKhamService.getActiveGoiKham());
    }
}
