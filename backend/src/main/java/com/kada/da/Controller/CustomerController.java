package com.kada.da.Controller;

import com.kada.da.Entity.KhachHang;
import com.kada.da.Service.KhachHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Hỗ trợ Frontend gọi API
public class CustomerController {

    private final KhachHangService khachHangService;

    // 1. Lấy danh sách toàn bộ khách hàng
    @GetMapping
    public ResponseEntity<List<KhachHang>> layDanhSachKhachHang() {
        return ResponseEntity.ok(khachHangService.layTatCaKhachHang());
    }

    // 2. Lấy thông tin chi tiết 1 khách hàng theo Mã
    @GetMapping("/{maKh}")
    public ResponseEntity<KhachHang> layKhachHangTheoId(@PathVariable("maKh") String maKh) {
        return ResponseEntity.ok(khachHangService.timKhachHangTheoId(maKh));
    }

    // 3. Tìm khách hàng theo Số điện thoại (Dành cho Lễ tân search)
    @GetMapping("/search")
    public ResponseEntity<KhachHang> timKhachHangTheoSdt(@RequestParam("sdt") String sdt) {
        return ResponseEntity.ok(khachHangService.timKhachHangTheoSdt(sdt));
    }

    // 4. Tạo mới khách hàng (Tiếp tân đẩy dữ liệu xuống Service)
    @PostMapping
    public ResponseEntity<KhachHang> taoKhachHang(@RequestBody KhachHang khachHang) {
        // Mọi logic kiểm tra lỗi, SĐT trùng... thằng Service nó lo hết bên trong hàm
        // này rồi
        KhachHang newKhachHang = khachHangService.taoMoiKhachHang(khachHang);
        return ResponseEntity.status(HttpStatus.CREATED).body(newKhachHang);
    }

    // 5. Cập nhật thông tin khách hàng
    @PutMapping("/{maKh}")
    public ResponseEntity<KhachHang> capNhatKhachHang(@PathVariable("maKh") String maKh,
            @RequestBody KhachHang khachHang) {
        KhachHang updatedKhachHang = khachHangService.capNhatKhachHang(maKh, khachHang);
        return ResponseEntity.ok(updatedKhachHang);
    }

    // 6. Xóa khách hàng (Xóa mềm)
    @DeleteMapping("/{maKh}")
    public ResponseEntity<String> xoaKhachHang(@PathVariable("maKh") String maKh) {
        khachHangService.xoaMemKhachHang(maKh);
        return ResponseEntity.ok("Đã xóa thành công khách hàng mã: " + maKh);
    }
}