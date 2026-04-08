package com.kada.da.Controller;

import com.kada.da.Dto.XuLyKinhRequestDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Dto.Response.XuLyKinhResponseDTO;
import com.kada.da.Service.XuLyKinhService;
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
@RequestMapping("/api/xu-ly-kinh")
@RequiredArgsConstructor
public class XuLyKinhController {

    private final XuLyKinhService xuLyKinhService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BAC_SI', 'KY_THUAT')")
    public ResponseEntity<XuLyKinhResponseDTO> createXuLyKinh(
            @Valid @RequestBody XuLyKinhRequestDTO request) {
        log.info("API: Tạo xử lý kính mới cho đơn: {}", request.getMaDon());
        XuLyKinhResponseDTO response = xuLyKinhService.createXuLyKinh(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{maXl}")
    public ResponseEntity<XuLyKinhResponseDTO> getXuLyKinhById(@PathVariable String maXl) {
        return ResponseEntity.ok(xuLyKinhService.getXuLyKinhById(maXl));
    }

    @GetMapping
    public ResponseEntity<PageResponseDTO<XuLyKinhResponseDTO>> getAllXuLyKinh(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(xuLyKinhService.getAllXuLyKinh(page, size));
    }

    @GetMapping("/don-thuoc/{maDon}")
    public ResponseEntity<List<XuLyKinhResponseDTO>> getXuLyKinhByMaDon(@PathVariable String maDon) {
        return ResponseEntity.ok(xuLyKinhService.getXuLyKinhByMaDon(maDon));
    }

    @GetMapping("/trang-thai/{trangThai}")
    public ResponseEntity<List<XuLyKinhResponseDTO>> getXuLyKinhByTrangThai(@PathVariable String trangThai) {
        return ResponseEntity.ok(xuLyKinhService.getXuLyKinhByTrangThai(trangThai));
    }

    @PutMapping("/{maXl}/thong-so")
    @PreAuthorize("hasAnyRole('ADMIN', 'BAC_SI', 'KY_THUAT')")
    public ResponseEntity<XuLyKinhResponseDTO> updateThongSoKinh(
            @PathVariable String maXl,
            @RequestBody Object thongSoKinh) {
        return ResponseEntity.ok(xuLyKinhService.updateThongSoKinh(maXl, thongSoKinh));
    }

    @PatchMapping("/{maXl}/trang-thai")
    @PreAuthorize("hasAnyRole('ADMIN', 'BAC_SI', 'KY_THUAT')")
    public ResponseEntity<XuLyKinhResponseDTO> updateTrangThai(
            @PathVariable String maXl,
            @RequestParam String trangThai) {
        return ResponseEntity.ok(xuLyKinhService.updateTrangThai(maXl, trangThai));
    }

    @PostMapping("/{maXl}/bat-dau")
    @PreAuthorize("hasAnyRole('ADMIN', 'KY_THUAT')")
    public ResponseEntity<XuLyKinhResponseDTO> batDauXuLy(
            @PathVariable String maXl,
            @RequestParam String maKyThuat) {
        return ResponseEntity.ok(xuLyKinhService.batDauXuLy(maXl, maKyThuat));
    }

    @PostMapping("/{maXl}/hoan-thanh")
    @PreAuthorize("hasAnyRole('ADMIN', 'KY_THUAT')")
    public ResponseEntity<XuLyKinhResponseDTO> hoanThanhXuLy(@PathVariable String maXl) {
        return ResponseEntity.ok(xuLyKinhService.hoanThanhXuLy(maXl));
    }

    @PostMapping("/{maXl}/huy")
    @PreAuthorize("hasAnyRole('ADMIN', 'BAC_SI', 'KY_THUAT')")
    public ResponseEntity<XuLyKinhResponseDTO> huyXuLy(
            @PathVariable String maXl,
            @RequestParam(required = false) String lyDo) {
        return ResponseEntity.ok(xuLyKinhService.huyXuLy(maXl, lyDo));
    }

    @GetMapping("/can-xu-ly")
    public ResponseEntity<List<XuLyKinhResponseDTO>> getXuLyKinhCanXuLy() {
        return ResponseEntity.ok(xuLyKinhService.getXuLyKinhCanXuLy());
    }

    @GetMapping("/dang-xu-ly/ky-thuat/{maKyThuat}")
    public ResponseEntity<List<XuLyKinhResponseDTO>> getXuLyKinhByKyThuatAndDangXuLy(
            @PathVariable String maKyThuat) {
        return ResponseEntity.ok(xuLyKinhService.getXuLyKinhByKyThuatAndTrangThai(maKyThuat, "Đang xử lý"));
    }
}