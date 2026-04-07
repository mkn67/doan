package com.kada.da.Controller;

import com.kada.da.Dto.NhanSuRequestDTO;
import com.kada.da.Dto.Response.NhanSuResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Service.NhanSuService; // Tự tạo file Service tương ứng nhé
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}