package com.kada.da.Controller;

import com.kada.da.Dto.LichLamViecRequestDTO;
import com.kada.da.Dto.Response.LichLamViecResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Service.LichLamViecService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/lich-lam-viec")
@RequiredArgsConstructor
public class LichLamViecController {

    private final LichLamViecService lichLamViecService;

    // ĐÃ SỬA: Đổi kiểu trả về thành String, gọi hàm taoLichLamViec (void)
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'QUAN_LY')")
    public ResponseEntity<String> createLichLamViec(
            @Valid @RequestBody LichLamViecRequestDTO request) {
        log.info("API: Tạo lịch làm việc cho nhân sự: {}", request.getMaNs());

        lichLamViecService.taoLichLamViec(request); // Gọi SP

        return ResponseEntity.status(HttpStatus.CREATED).body("Tạo lịch làm việc thành công!");
    }

    // ĐÃ SỬA: Đổi kiểu trả về thành String, gọi hàm batch (void)
    @PostMapping("/batch")
    @PreAuthorize("hasAnyRole('ADMIN', 'QUAN_LY')")
    public ResponseEntity<String> createLichLamViecBatch(
            @Valid @RequestBody List<LichLamViecRequestDTO> requests) {
        log.info("API: Tạo lịch làm việc hàng loạt - số lượng: {}", requests.size());

        lichLamViecService.createLichLamViecBatch(requests); // Gọi SP hàng loạt

        return ResponseEntity.status(HttpStatus.CREATED).body("Tạo " + requests.size() + " lịch làm việc thành công!");
    }

    @GetMapping("/{maLlv}")
    public ResponseEntity<LichLamViecResponseDTO> getLichLamViecById(
            @PathVariable String maLlv) {
        log.info("API: Lấy lịch làm việc theo mã: {}", maLlv);
        LichLamViecResponseDTO response = lichLamViecService.getLichLamViecById(maLlv);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<PageResponseDTO<LichLamViecResponseDTO>> getAllLichLamViec(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("API: Lấy danh sách lịch làm việc - page: {}, size: {}", page, size);
        PageResponseDTO<LichLamViecResponseDTO> response = lichLamViecService.getAllLichLamViec(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/nhan-su/{maNs}")
    public ResponseEntity<List<LichLamViecResponseDTO>> getLichLamViecByNhanSu(
            @PathVariable String maNs) {
        log.info("API: Lấy lịch làm việc theo nhân sự: {}", maNs);
        List<LichLamViecResponseDTO> response = lichLamViecService.getLichLamViecByNhanSu(maNs);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/nhan-su/{maNs}/trong-khoang")
    public ResponseEntity<List<LichLamViecResponseDTO>> getLichLamViecByNhanSuAndDateRange(
            @PathVariable String maNs,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        log.info("API: Lấy lịch làm việc theo nhân sự {} từ {} đến {}", maNs, fromDate, toDate);
        List<LichLamViecResponseDTO> response = lichLamViecService.getLichLamViecByNhanSuAndDateRange(maNs, fromDate,
                toDate);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ngay")
    public ResponseEntity<List<LichLamViecResponseDTO>> getLichLamViecByNgay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ngay) {
        log.info("API: Lấy lịch làm việc theo ngày: {}", ngay);
        List<LichLamViecResponseDTO> response = lichLamViecService.getLichLamViecByNgay(ngay);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/khung-gio")
    public ResponseEntity<List<LichLamViecResponseDTO>> getLichLamViecByKhungGio(
            @RequestParam Double gioBatDau,
            @RequestParam Double gioKetThuc) {
        log.info("API: Lấy lịch làm việc theo khung giờ: {} đến {}", gioBatDau, gioKetThuc);
        List<LichLamViecResponseDTO> response = lichLamViecService.getLichLamViecByKhungGio(gioBatDau, gioKetThuc);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-ranh")
    public ResponseEntity<Boolean> checkNhanSuRanh(
            @RequestParam String maNs,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ngay,
            @RequestParam Double gioBatDau) {
        log.info("API: Kiểm tra nhân sự {} rảnh ngày {} lúc {}h", maNs, ngay, gioBatDau);
        boolean isRanh = lichLamViecService.isNhanSuRanh(maNs, ngay, gioBatDau);
        return ResponseEntity.ok(isRanh);
    }

    @GetMapping("/nhan-su-ranh")
    public ResponseEntity<List<LichLamViecResponseDTO>> getNhanSuRanh(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ngay,
            @RequestParam Double gioBatDau) {
        log.info("API: Lấy danh sách nhân sự rảnh ngày {} lúc {}h", ngay, gioBatDau);
        List<LichLamViecResponseDTO> response = lichLamViecService.getNhanSuRanh(ngay, gioBatDau);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{maLlv}")
    @PreAuthorize("hasAnyRole('ADMIN', 'QUAN_LY')")
    public ResponseEntity<LichLamViecResponseDTO> updateLichLamViec(
            @PathVariable String maLlv,
            @Valid @RequestBody LichLamViecRequestDTO request) {
        log.info("API: Cập nhật lịch làm việc: {}", maLlv);
        LichLamViecResponseDTO response = lichLamViecService.updateLichLamViec(maLlv, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{maLlv}")
    @PreAuthorize("hasAnyRole('ADMIN', 'QUAN_LY')")
    public ResponseEntity<Void> deleteLichLamViec(@PathVariable String maLlv) {
        log.info("API: Xóa lịch làm việc: {}", maLlv);
        lichLamViecService.deleteLichLamViec(maLlv);
        return ResponseEntity.noContent().build();
    }
}