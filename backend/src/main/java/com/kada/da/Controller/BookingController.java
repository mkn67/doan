package com.kada.da.Controller;

import com.kada.da.Dto.DatLichRequestDTO;
import com.kada.da.Dto.Response.DatLichResponseDTO;
import com.kada.da.Dto.Response.HangChoResponseDTO;
import com.kada.da.Dto.Response.LichHenResponseDTO;
import com.kada.da.Service.LichHenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
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
}