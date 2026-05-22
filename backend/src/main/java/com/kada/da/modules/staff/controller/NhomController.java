package com.kada.da.modules.staff.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.kada.da.modules.staff.dto.NhomRequestDTO;
import com.kada.da.modules.staff.dto.NhomResponseDTO;
import com.kada.da.modules.staff.service.NhomService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/nhom")
@RequiredArgsConstructor
public class NhomController {

    private final NhomService nhomService;

    @GetMapping
    public ResponseEntity<List<NhomResponseDTO>> getAllNhomList() {
        return ResponseEntity.ok(nhomService.getAllNhomList());
    }

    @GetMapping("/{maNhom}")
    public ResponseEntity<NhomResponseDTO> getNhomById(@PathVariable String maNhom) {
        return ResponseEntity.ok(nhomService.getNhomById(maNhom));
    }

    @PostMapping
    public ResponseEntity<NhomResponseDTO> createNhom(@Valid @RequestBody NhomRequestDTO request) {
        return new ResponseEntity<>(nhomService.createNhom(request), HttpStatus.CREATED);
    }

    @PutMapping("/{maNhom}")
    public ResponseEntity<NhomResponseDTO> updateNhom(@PathVariable String maNhom,
            @Valid @RequestBody NhomRequestDTO request) {
        return ResponseEntity.ok(nhomService.updateNhom(maNhom, request));
    }

    @DeleteMapping("/{maNhom}")
    public ResponseEntity<Void> deleteNhom(@PathVariable String maNhom) {
        nhomService.deleteNhom(maNhom);
        return ResponseEntity.noContent().build();
    }
}
