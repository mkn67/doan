package com.kada.da.Controller;

import com.kada.da.Dto.DichVuKhamRequestDTO;
import com.kada.da.Dto.Response.DichVuKhamResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Service.DichVuKhamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dich-vu-kham")
@RequiredArgsConstructor
public class DichVuKhamController {

    private final DichVuKhamService dichVuKhamService;

    @PostMapping
    public ResponseEntity<DichVuKhamResponseDTO> createDichVu(@Valid @RequestBody DichVuKhamRequestDTO request) {
        return new ResponseEntity<>(dichVuKhamService.createDichVu(request), HttpStatus.CREATED);
    }

    @PutMapping("/{maDv}")
    public ResponseEntity<DichVuKhamResponseDTO> updateDichVu(@PathVariable String maDv,
            @Valid @RequestBody DichVuKhamRequestDTO request) {
        return ResponseEntity.ok(dichVuKhamService.updateDichVu(maDv, request));
    }

    @GetMapping
    public ResponseEntity<PageResponseDTO<DichVuKhamResponseDTO>> getAllDichVu(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(dichVuKhamService.getAllDichVu(page, size));
    }
}