package com.kada.da.modules.customer.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.modules.customer.domain.KhachHang;
import com.kada.da.modules.customer.dto.KhachHangResponseDTO;
import com.kada.da.modules.customer.service.KhachHangService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/khach-hang")
@RequiredArgsConstructor
// SỬA DÒNG NÀY: Thay "*" bằng địa chỉ cụ thể của Frontend
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CustomerController {

    private final KhachHangService khachHangService;

    // 1. Lấy danh sách toàn bộ khách hàng (Đã fix lỗi Mapping)
    @GetMapping
    public ResponseEntity<List<KhachHangResponseDTO>> layDanhSachKhachHang() {
        List<KhachHang> entities = khachHangService.layTatCaKhachHang();

        List<KhachHangResponseDTO> dtos = entities.stream()
                .map(kh -> KhachHangResponseDTO.builder()
                .maKh(kh.getMaKh())
                .hoTen(kh.getHoTen())
                .sdt(kh.getSdt())
                .diaChi(kh.getDiaChi())
                // .gioiTinh(kh.getGioiTinh()) // Nếu Entity có thì hãy bỏ comment dòng này
                // BỎ email và ghiChu vì Entity của ông giáo không có 2 trường này
                .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // 2. Lấy thông tin chi tiết 1 khách hàng (Trả về Entity hoặc DTO tùy ông giáo)
    @GetMapping("/{maKh}")
    public ResponseEntity<KhachHang> layKhachHangTheoId(@PathVariable("maKh") String maKh) {
        return ResponseEntity.ok(khachHangService.timKhachHangTheoId(maKh));
    }

    // 3. Tìm khách hàng theo Số điện thoại
    @GetMapping("/search")
    public ResponseEntity<KhachHang> timKhachHangTheoSdt(@RequestParam("sdt") String sdt) {
        return ResponseEntity.ok(khachHangService.timKhachHangTheoSdt(sdt));
    }

    // 4. Tạo mới khách hàng
    @PostMapping
    public ResponseEntity<KhachHang> taoKhachHang(@RequestBody KhachHang khachHang) {
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

    // 6. Xóa khách hàng
    @DeleteMapping("/{maKh}")
    public ResponseEntity<String> xoaKhachHang(@PathVariable("maKh") String maKh) {
        khachHangService.xoaMemKhachHang(maKh);
        return ResponseEntity.ok("Đã xóa thành công khách hàng mã: " + maKh);
    }

    // 7. Cộng điểm thủ công
    @PostMapping("/{maKh}/cong-diem")
    public ResponseEntity<String> congDiemChoKhach(
            @PathVariable String maKh,
            @RequestParam Integer soDiem,
            @RequestParam String lyDo,
            @RequestParam(required = false) String maHd) {

        khachHangService.congDiemThuCong(maKh, soDiem, lyDo, maHd);
        return ResponseEntity.ok("Đã cộng " + soDiem + " điểm cho khách hàng " + maKh);
    }

    // 8. Lấy lịch sử khám cuối
    @GetMapping("/{maKh}/lich-su-cuoi")
    public ResponseEntity<String> getLichSuCuoi(@PathVariable String maKh) {
        return ResponseEntity.ok(khachHangService.layLichSuKhamMoiNhat(maKh));
    }
}
