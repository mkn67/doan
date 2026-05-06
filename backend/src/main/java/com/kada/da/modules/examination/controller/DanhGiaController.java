package com.kada.da.modules.examination.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.modules.examination.dto.DanhGiaRequestDTO;
import com.kada.da.modules.examination.dto.DanhGiaResponseDTO;
import com.kada.da.modules.examination.service.DanhGiaService;
import com.kada.da.modules.staff.dto.PageResponseDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/danh-gia")
@RequiredArgsConstructor
public class DanhGiaController {

    private final DanhGiaService danhGiaService;

    /**
     * Tạo đánh giá mới (khách hàng đánh giá sau khi khám)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('KHACH_HANG', 'ADMIN')")
    public ResponseEntity<DanhGiaResponseDTO> createDanhGia(
            @Valid @RequestBody DanhGiaRequestDTO request) {
        log.info("API: Tạo đánh giá mới cho hồ sơ: {}", request.getMaHoSo());
        DanhGiaResponseDTO response = danhGiaService.createDanhGia(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lấy đánh giá theo mã
     */
    @GetMapping("/{maDg}")
    public ResponseEntity<DanhGiaResponseDTO> getDanhGiaById(
            @PathVariable String maDg) {
        log.info("API: Lấy đánh giá theo mã: {}", maDg);
        DanhGiaResponseDTO response = danhGiaService.getDanhGiaById(maDg);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách đánh giá (phân trang)
     */
    @GetMapping
    public ResponseEntity<PageResponseDTO<DanhGiaResponseDTO>> getAllDanhGia(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("API: Lấy danh sách đánh giá - page: {}, size: {}", page, size);
        PageResponseDTO<DanhGiaResponseDTO> response = danhGiaService.getAllDanhGia(page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy đánh giá theo hồ sơ khám
     */
    @GetMapping("/ho-so/{maHoso}")
    public ResponseEntity<DanhGiaResponseDTO> getDanhGiaByMaHoso(
            @PathVariable String maHoso) {
        log.info("API: Lấy đánh giá theo hồ sơ: {}", maHoso);
        DanhGiaResponseDTO response = danhGiaService.getDanhGiaByMaHoso(maHoso);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách đánh giá theo khách hàng
     */
    @GetMapping("/khach-hang/{maKh}")
    public ResponseEntity<List<DanhGiaResponseDTO>> getDanhGiaByMaKh(
            @PathVariable String maKh) {
        log.info("API: Lấy đánh giá theo khách hàng: {}", maKh);
        List<DanhGiaResponseDTO> response = danhGiaService.getDanhGiaByMaKh(maKh);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách đánh giá theo bác sĩ
     */
    @GetMapping("/bac-si/{maNs}")
    public ResponseEntity<List<DanhGiaResponseDTO>> getDanhGiaByMaNs(
            @PathVariable String maNs) {
        log.info("API: Lấy đánh giá theo bác sĩ: {}", maNs);
        List<DanhGiaResponseDTO> response = danhGiaService.getDanhGiaByMaNs(maNs);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách đánh giá theo số sao
     */
    @GetMapping("/sao/{soSao}")
    public ResponseEntity<List<DanhGiaResponseDTO>> getDanhGiaBySoSao(
            @PathVariable Integer soSao) {
        log.info("API: Lấy đánh giá theo số sao: {}", soSao);
        List<DanhGiaResponseDTO> response = danhGiaService.getDanhGiaBySoSao(soSao);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách đánh giá hiển thị công khai
     */
    @GetMapping("/hien-thi")
    public ResponseEntity<List<DanhGiaResponseDTO>> getDanhGiaHienThi() {
        log.info("API: Lấy danh sách đánh giá hiển thị công khai");
        List<DanhGiaResponseDTO> response = danhGiaService.getDanhGiaHienThi();
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách đánh giá gần đây (theo ngày)
     */
    @GetMapping("/gan-day")
    public ResponseEntity<List<DanhGiaResponseDTO>> getDanhGiaGanDay(
            @RequestParam(defaultValue = "7") int days) {
        log.info("API: Lấy đánh giá {} ngày gần đây", days);
        List<DanhGiaResponseDTO> response = danhGiaService.getDanhGiaGanDay(days);
        return ResponseEntity.ok(response);
    }

    /**
     * Cập nhật đánh giá
     */
    @PutMapping("/{maDg}")
    @PreAuthorize("hasAnyRole('KHACH_HANG', 'ADMIN')")
    public ResponseEntity<DanhGiaResponseDTO> updateDanhGia(
            @PathVariable String maDg,
            @Valid @RequestBody DanhGiaRequestDTO request) {
        log.info("API: Cập nhật đánh giá: {}", maDg);
        DanhGiaResponseDTO response = danhGiaService.updateDanhGia(maDg, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Ẩn/hiện đánh giá (Admin)
     */
    @PatchMapping("/{maDg}/hide")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DanhGiaResponseDTO> toggleHidden(
            @PathVariable String maDg,
            @RequestParam boolean hidden) {
        log.info("API: {} đánh giá: {}", hidden ? "Ẩn" : "Hiện", maDg);
        DanhGiaResponseDTO response = danhGiaService.toggleHidden(maDg, hidden);
        return ResponseEntity.ok(response);
    }

    /**
     * Xóa đánh giá (Admin)
     */
    @DeleteMapping("/{maDg}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDanhGia(@PathVariable String maDg) {
        log.info("API: Xóa đánh giá: {}", maDg);
        danhGiaService.deleteDanhGia(maDg);
        return ResponseEntity.noContent().build();
    }

    /**
     * Thống kê điểm trung bình của bác sĩ
     */
    @GetMapping("/thong-ke/bac-si/{maNs}")
    public ResponseEntity<Double> getTrungBinhSaoByBacSi(
            @PathVariable String maNs) {
        log.info("API: Thống kê điểm trung bình của bác sĩ: {}", maNs);
        Double response = danhGiaService.getTrungBinhSaoByBacSi(maNs);
        return ResponseEntity.ok(response);
    }

    /**
     * Thống kê tỷ lệ đánh giá theo số sao
     */
    @GetMapping("/thong-ke/ty-le")
    public ResponseEntity<Object> getTyLeDanhGia() {
        log.info("API: Thống kê tỷ lệ đánh giá theo số sao");
        Object response = danhGiaService.getTyLeDanhGia();
        return ResponseEntity.ok(response);
    }
}
