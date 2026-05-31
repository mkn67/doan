package com.kada.da.modules.customer.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

import com.kada.da.modules.billing.Enum.TrangThaiHoaDon;
import com.kada.da.modules.billing.domain.HoaDon;
import com.kada.da.modules.billing.repository.HoaDonRepository;
import com.kada.da.modules.booking.domain.LichHen;
import com.kada.da.modules.booking.repository.LichHenRepository;
import com.kada.da.modules.customer.domain.KhachHang;
import com.kada.da.modules.customer.dto.KhachHangResponseDTO;
import com.kada.da.modules.customer.mapper.KhachHangMapper;
import com.kada.da.modules.customer.service.KhachHangService;
import com.kada.da.modules.examination.domain.HoSoThiLuc;
import com.kada.da.modules.examination.repository.HoSoThiLucRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/khach-hang")
@RequiredArgsConstructor
// SỬA DÒNG NÀY: Thay "*" bằng địa chỉ cụ thể của Frontend
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CustomerController {

    private final KhachHangService khachHangService;
    private final HoSoThiLucRepository hoSoThiLucRepository;
    private final LichHenRepository lichHenRepository;
    private final HoaDonRepository hoaDonRepository;

    private KhachHangResponseDTO mapToResponseDTO(KhachHang kh) {
        if (kh == null) return null;
        
        KhachHangResponseDTO dto = KhachHangMapper.toResponse(kh);

        // 1. Calculate tongSoLanKham
        int tongSoLanKham = 0;
        try {
            List<HoSoThiLuc> hoSoList = hoSoThiLucRepository.findByKhachHang_MaKhOrderByNgayKhamDesc(kh.getMaKh());
            if (hoSoList != null) {
                tongSoLanKham = hoSoList.size();
            }
        } catch (Exception e) {
            // log error or fallback
        }
        dto.setTongSoLanKham(tongSoLanKham);

        // 2. Calculate tongChiTieu (paid invoices status = DA_THANH_TOAN)
        double tongChiTieu = 0.0;
        try {
            List<HoaDon> hoaDonList = hoaDonRepository.findByKhachHang_MaKhOrderByNgayLapDesc(kh.getMaKh());
            if (hoaDonList != null) {
                for (HoaDon hd : hoaDonList) {
                    if (hd.getTrangThai() == TrangThaiHoaDon.DA_THANH_TOAN && hd.getTongTien() != null) {
                        tongChiTieu += hd.getTongTien().doubleValue();
                    }
                }
            }
        } catch (Exception e) {
            // fallback
        }
        dto.setTongChiTieu(tongChiTieu);

        // 3. Find lichHenGanNhat
        try {
            List<LichHen> lichHenList = lichHenRepository.findByKhachHang_MaKhOrderByNgayHenDesc(kh.getMaKh());
            if (lichHenList != null && !lichHenList.isEmpty()) {
                LichHen latest = lichHenList.get(0);
                if (latest.getNgayHen() != null) {
                    dto.setLichHenGanNhat(latest.getNgayHen().toString());
                }
            }
        } catch (Exception e) {
            // fallback
        }

        dto.setNgayTao(java.time.LocalDateTime.now()); // fallback for UI

        return dto;
    }

    // 1. Lấy danh sách toàn bộ khách hàng (Đã fix lỗi Mapping)
    @GetMapping
    public ResponseEntity<List<KhachHangResponseDTO>> layDanhSachKhachHang() {
        List<KhachHang> entities = khachHangService.layTatCaKhachHang();
        List<KhachHangResponseDTO> dtos = entities.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // 2. Lấy thông tin chi tiết 1 khách hàng (Trả về Entity hoặc DTO tùy ông giáo)
    @GetMapping("/{maKh}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LE_TAN', 'BAC_SI') or (hasRole('CUSTOMER') and @khachHangService.timKhachHangTheoId(#maKh).taiKhoan != null and @khachHangService.timKhachHangTheoId(#maKh).taiKhoan.username.equalsIgnoreCase(authentication.name))")
    public ResponseEntity<KhachHangResponseDTO> layKhachHangTheoId(@PathVariable("maKh") String maKh) {
        KhachHang kh = khachHangService.timKhachHangTheoId(maKh);
        return ResponseEntity.ok(mapToResponseDTO(kh));
    }

    // 3. Tìm khách hàng theo Số điện thoại
    @GetMapping("/search")
    public ResponseEntity<KhachHangResponseDTO> timKhachHangTheoSdt(@RequestParam("sdt") String sdt) {
        KhachHang kh = khachHangService.timKhachHangTheoSdt(sdt);
        return ResponseEntity.ok(mapToResponseDTO(kh));
    }

    // 4. Tạo mới khách hàng
    @PostMapping
    public ResponseEntity<KhachHangResponseDTO> taoKhachHang(@RequestBody KhachHang khachHang) {
        KhachHang newKhachHang = khachHangService.taoMoiKhachHang(khachHang);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponseDTO(newKhachHang));
    }

    // 5. Cập nhật thông tin khách hàng
    @PutMapping("/{maKh}")
    public ResponseEntity<KhachHangResponseDTO> capNhatKhachHang(@PathVariable("maKh") String maKh,
            @RequestBody KhachHang khachHang) {
        KhachHang updatedKhachHang = khachHangService.capNhatKhachHang(maKh, khachHang);
        return ResponseEntity.ok(mapToResponseDTO(updatedKhachHang));
    }

    // 6. Xóa khách hàng
    @DeleteMapping("/{maKh}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LE_TAN')")
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
