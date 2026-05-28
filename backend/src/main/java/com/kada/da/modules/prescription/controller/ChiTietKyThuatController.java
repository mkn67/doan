package com.kada.da.modules.prescription.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.modules.prescription.dto.ChiTietKyThuatRequestDTO;
import com.kada.da.modules.prescription.dto.ChiTietKyThuatResponseDTO;
import com.kada.da.modules.prescription.service.ChiTietKyThuatService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/ky-thuat")
@RequiredArgsConstructor
public class ChiTietKyThuatController {

    private final ChiTietKyThuatService chiTietKyThuatService;

    @PostMapping
    public ResponseEntity<ChiTietKyThuatResponseDTO> saveKyThuat(@Valid @RequestBody ChiTietKyThuatRequestDTO request) {
        ChiTietKyThuatResponseDTO response = chiTietKyThuatService.saveKyThuat(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
