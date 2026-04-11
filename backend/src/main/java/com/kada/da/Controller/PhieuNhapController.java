package com.kada.da.Controller;

import com.kada.da.Dto.PhieuNhapRequestDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Dto.Response.PhieuNhapResponseDTO;
import com.kada.da.Service.PhieuNhapService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/phieu-nhap")
@RequiredArgsConstructor
public class PhieuNhapController {

    private final PhieuNhapService phieuNhapService;

    // =========================================================
    // 1. API NHẬP KHO (GỌI STORED PROCEDURE)
    // =========================================================
    @PostMapping("/nhap-kho")
    @PreAuthorize("hasAnyRole('ADMIN', 'QUAN_LY_KHO')") // Mở ra nếu ông dùng Spring Security phân quyền
    public ResponseEntity<PhieuNhapResponseDTO> nhapKhoLoHang(
            @Valid @RequestBody PhieuNhapRequestDTO request) {
        log.info("API: Nhận yêu cầu nhập kho từ NCC: {}, Nhân viên: {}", request.getMaNcc(), request.getMaNs());

        PhieuNhapResponseDTO response = phieuNhapService.nhapKhoHoanChinh(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // =========================================================
    // 2. CÁC API TRA CỨU
    // =========================================================

    @GetMapping("/{maPn}")
    public ResponseEntity<PhieuNhapResponseDTO> getPhieuNhapById(@PathVariable String maPn) {
        log.info("API: Lấy chi tiết phiếu nhập mã: {}", maPn);
        PhieuNhapResponseDTO response = phieuNhapService.getPhieuNhapById(maPn);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<PageResponseDTO<PhieuNhapResponseDTO>> getAllPhieuNhap(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("API: Lấy danh sách phiếu nhập - page: {}, size: {}", page, size);
        PageResponseDTO<PhieuNhapResponseDTO> response = phieuNhapService.getAllPhieuNhap(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/nha-cung-cap/{maNcc}")
    public ResponseEntity<List<PhieuNhapResponseDTO>> getPhieuNhapByNhaCungCap(@PathVariable String maNcc) {
        log.info("API: Lấy danh sách phiếu nhập của Nhà Cung Cấp: {}", maNcc);
        List<PhieuNhapResponseDTO> response = phieuNhapService.getPhieuNhapByNhaCungCap(maNcc);
        return ResponseEntity.ok(response);
    }
}