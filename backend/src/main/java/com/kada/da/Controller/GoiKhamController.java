package com.kada.da.Controller;

import com.kada.da.Dto.GoiKhamRequestDTO;
import com.kada.da.Dto.Response.GoiKhamResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Service.GoiKhamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}