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

    /**
     * Tạo xử lý kính mới (từ đơn kê)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BAC_SI', 'KY_THUAT')")
    public ResponseEntity<XuLyKinhResponseDTO> createXuLyKinh(
            @Valid @RequestBody XuLyKinhRequestDTO request) {
        log.info("API: Tạo xử lý kính mới cho đơn: {}", request.getMaHd());
        XuLyKinhResponseDTO response = xuLyKinhService.createXuLyKinh(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lấy xử lý kính theo mã
     */
    @GetMapping("/{maXl}")
    public ResponseEntity<XuLyKinhResponseDTO> getXuLyKinhById(
            @PathVariable String maXl) {
        log.info("API: Lấy xử lý kính theo mã: {}", maXl);
        XuLyKinhResponseDTO response = xuLyKinhService.getXuLyKinhById(maXl);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách xử lý kính (phân trang)
     */
    @GetMapping
    public ResponseEntity<PageResponseDTO<XuLyKinhResponseDTO>> getAllXuLyKinh(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("API: Lấy danh sách xử lý kính - page: {}, size: {}", page, size);
        PageResponseDTO<XuLyKinhResponseDTO> response = xuLyKinhService.getAllXuLyKinh(page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy xử lý kính theo đơn thuốc
     */
    @GetMapping("/don-thuoc/{maDon}")
    public ResponseEntity<List<XuLyKinhResponseDTO>> getXuLyKinhByMaDon(
            @PathVariable String maDon) {
        log.info("API: Lấy xử lý kính theo đơn thuốc: {}", maDon);
        List<XuLyKinhResponseDTO> response = xuLyKinhService.getXuLyKinhByMaDon(maDon);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy xử lý kính theo trạng thái
     */
    @GetMapping("/trang-thai/{trangThai}")
    public ResponseEntity<List<XuLyKinhResponseDTO>> getXuLyKinhByTrangThai(
            @PathVariable String trangThai) {
        log.info("API: Lấy xử lý kính theo trạng thái: {}", trangThai);
        List<XuLyKinhResponseDTO> response = xuLyKinhService.getXuLyKinhByTrangThai(trangThai);
        return ResponseEntity.ok(response);
    }

    /**
     * Cập nhật thông số kính
     */
    @PutMapping("/{maXl}/thong-so")
    @PreAuthorize("hasAnyRole('ADMIN', 'BAC_SI', 'KY_THUAT')")
    public ResponseEntity<XuLyKinhResponseDTO> updateThongSoKinh(
            @PathVariable String maXl,
            @RequestBody Object thongSoKinh) {
        log.info("API: Cập nhật thông số kính cho xử lý: {}", maXl);
        XuLyKinhResponseDTO response = xuLyKinhService.updateThongSoKinh(maXl, thongSoKinh);
        return ResponseEntity.ok(response);
    }

    /**
     * Cập nhật trạng thái xử lý kính
     */
    @PatchMapping("/{maXl}/trang-thai")
    @PreAuthorize("hasAnyRole('ADMIN', 'BAC_SI', 'KY_THUAT')")
    public ResponseEntity<XuLyKinhResponseDTO> updateTrangThai(
            @PathVariable String maXl,
            @RequestParam String trangThai) {
        log.info("API: Cập nhật trạng thái xử lý kính {} thành {}", maXl, trangThai);
        XuLyKinhResponseDTO response = xuLyKinhService.updateTrangThai(maXl, trangThai);
        return ResponseEntity.ok(response);
    }

    /**
     * Bắt đầu xử lý kính (chuyển từ Chờ xử lý sang Đang xử lý)
     */
    @PostMapping("/{maXl}/bat-dau")
    @PreAuthorize("hasAnyRole('ADMIN', 'KY_THUAT')")
    public ResponseEntity<XuLyKinhResponseDTO> batDauXuLy(
            @PathVariable String maXl,
            @RequestParam String maKyThuat) {
        log.info("API: Bắt đầu xử lý kính {} cho kỹ thuật viên {}", maXl, maKyThuat);
        XuLyKinhResponseDTO response = xuLyKinhService.batDauXuLy(maXl, maKyThuat);
        return ResponseEntity.ok(response);
    }

    /**
     * Hoàn thành xử lý kính
     */
    @PostMapping("/{maXl}/hoan-thanh")
    @PreAuthorize("hasAnyRole('ADMIN', 'KY_THUAT')")
    public ResponseEntity<XuLyKinhResponseDTO> hoanThanhXuLy(
            @PathVariable String maXl) {
        log.info("API: Hoàn thành xử lý kính: {}", maXl);
        XuLyKinhResponseDTO response = xuLyKinhService.hoanThanhXuLy(maXl);
        return ResponseEntity.ok(response);
    }

    /**
     * Hủy xử lý kính
     */
    @PostMapping("/{maXl}/huy")
    @PreAuthorize("hasAnyRole('ADMIN', 'BAC_SI', 'KY_THUAT')")
    public ResponseEntity<XuLyKinhResponseDTO> huyXuLy(
            @PathVariable String maXl,
            @RequestParam(required = false) String lyDo) {
        log.info("API: Hủy xử lý kính: {} - Lý do: {}", maXl, lyDo);
        XuLyKinhResponseDTO response = xuLyKinhService.huyXuLy(maXl, lyDo);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách xử lý kính cần xử lý (đang chờ)
     */
    @GetMapping("/can-xu-ly")
    public ResponseEntity<List<XuLyKinhResponseDTO>> getXuLyKinhCanXuLy() {
        log.info("API: Lấy danh sách xử lý kính cần xử lý");
        List<XuLyKinhResponseDTO> response = xuLyKinhService.getXuLyKinhCanXuLy();
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách xử lý kính đang được xử lý bởi kỹ thuật viên
     */
    @GetMapping("/dang-xu-ly/ky-thuat/{maKyThuat}")
    public ResponseEntity<List<XuLyKinhResponseDTO>> getXuLyKinhByKyThuatAndDangXuLy(
            @PathVariable String maKyThuat) {
        log.info("API: Lấy xử lý kính đang xử lý bởi kỹ thuật viên: {}", maKyThuat);
        List<XuLyKinhResponseDTO> response = xuLyKinhService.getXuLyKinhByKyThuatAndTrangThai(
                maKyThuat, "Đang xử lý");
        return ResponseEntity.ok(response);
    }
}