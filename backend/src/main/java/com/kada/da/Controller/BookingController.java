package com.kada.da.Controller;

import com.kada.da.Dto.LichHenRequestDTO;
import com.kada.da.Dto.Response.LichHenResponseDTO;
import com.kada.da.Entity.HangCho;
import com.kada.da.Service.LichHenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Mở cửa cho Frontend gọi không bị lỗi CORS
public class BookingController {

    private final LichHenService lichHenService;

    // 1. Khách hàng/Lễ tân tạo lịch hẹn mới
    @PostMapping
    public ResponseEntity<LichHenResponseDTO> datLichHen(@RequestBody LichHenRequestDTO requestDTO) {
        LichHenResponseDTO response = lichHenService.createLichHen(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 2. Lễ tân xác nhận lịch hẹn (chuyển từ "Chờ xác nhận" -> "Đã xác nhận")
    @PutMapping("/{maLichHen}/confirm")
    public ResponseEntity<LichHenResponseDTO> xacNhanLichHen(@PathVariable("maLichHen") String maLichHen) {
        LichHenResponseDTO response = lichHenService.confirmLichHen(maLichHen);
        return ResponseEntity.ok(response);
    }

    // 3. Khách tới phòng khám -> Check-in -> Lấy số thứ tự
    @PostMapping("/{maLichHen}/check-in")
    public ResponseEntity<HangCho> checkIn(@PathVariable("maLichHen") String maLichHen) {
        // Hàm checkIn này sẽ trả về Entity HangCho, trong đó có chứa soThuTu
        HangCho hangCho = lichHenService.checkIn(maLichHen);
        return ResponseEntity.ok(hangCho);
    }

    // 4. Hủy lịch hẹn
    @PutMapping("/{maLichHen}/cancel")
    public ResponseEntity<String> huyLichHen(
            @PathVariable("maLichHen") String maLichHen,
            @RequestParam(value = "lyDo", required = false, defaultValue = "Khách hàng bận việc đột xuất") String lyDo) {

        lichHenService.cancelLichHen(maLichHen, lyDo);
        return ResponseEntity.ok("Đã hủy lịch hẹn " + maLichHen + " thành công!");
    }
}