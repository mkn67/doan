package com.kada.da.modules.booking.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.modules.booking.dto.DatLichRequestDTO;
import com.kada.da.modules.booking.dto.DatLichResponseDTO;
import com.kada.da.modules.booking.dto.HangChoResponseDTO;
import com.kada.da.modules.booking.dto.LichHenResponseDTO;
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
    public ResponseEntity<PageResponseDTO<LichHenResponseDTO>> getAllLichHen(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(lichHenService.getAllLichHen(page, size));
    }
}
