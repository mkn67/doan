package com.kada.da.modules.booking.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; // Dùng .* để import hết các annotation web

import com.kada.da.modules.booking.dto.DatLichRequestDTO;
import com.kada.da.modules.booking.dto.DatLichResponseDTO;
import com.kada.da.modules.booking.dto.HangChoResponseDTO;
import com.kada.da.modules.booking.dto.LichHenFilterDTO;
import com.kada.da.modules.booking.dto.LichHenResponseDTO;
import com.kada.da.modules.booking.dto.LichHenTrieuChungDto;
import com.kada.da.modules.booking.service.LichHenService;
import com.kada.da.modules.staff.dto.PageResponseDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final LichHenService lichHenService;

    @PostMapping("/dat-lich")
    public ResponseEntity<DatLichResponseDTO> datLichHen(@RequestBody DatLichRequestDTO request) {
        DatLichResponseDTO response = lichHenService.datLichHen(
                request.getMaKh(), request.getMaNs(), request.getMaGoi(),
                request.getNgayHen(), request.getGioHen());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/huy-lich/{maLh}")
    public ResponseEntity<Void> huyLichHen(@PathVariable String maLh) {
        lichHenService.huyLichHen(maLh);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{maLichHen}/confirm")
    public ResponseEntity<LichHenResponseDTO> xacNhanLichHen(@PathVariable("maLichHen") String maLichHen) {
        LichHenResponseDTO response = lichHenService.confirmLichHen(maLichHen);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{maLichHen}/check-in")
    public ResponseEntity<HangChoResponseDTO> checkIn(@PathVariable("maLichHen") String maLichHen) {
        HangChoResponseDTO response = lichHenService.checkIn(maLichHen);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<PageResponseDTO<LichHenResponseDTO>> getAllLichHen(LichHenFilterDTO filter) {
        /* 
           LƯU Ý CỦA ÔNG GIÁO: 
           1. Đã đổi PageResponseDTO<LichHenFilterDTO> thành <LichHenResponseDTO> (Sửa lỗi logic)
           2. Bỏ @RequestParam rời rạc vì Spring sẽ tự map ?page=...&size=... vào object filter (Gọn code)
         */
        return ResponseEntity.ok(lichHenService.getAllLichHen(filter));
    }

    @GetMapping("/trieu-chung")
    public ResponseEntity<java.util.List<LichHenTrieuChungDto>> getLichHenKemTrieuChung() {
        return ResponseEntity.ok(lichHenService.getLichHenKemTrieuChung());
    }
}
