package com.kada.da.modules.staff.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.modules.staff.dto.ChucVuDTO;
import com.kada.da.modules.staff.repository.ChucVuRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/chuc-vu")
@RequiredArgsConstructor
public class ChucVuController {

    private final ChucVuRepository chucVuRepository;

    @GetMapping
    public ResponseEntity<List<ChucVuDTO>> getAllChucVu() {
        List<ChucVuDTO> list = chucVuRepository.findAll().stream()
                .map(cv -> new ChucVuDTO(cv.getMaCv(), cv.getTenCv(), null))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }
}
