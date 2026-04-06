package com.kada.da.Controller;

import com.kada.da.Entity.LoHang;
import com.kada.da.Repository.LoHangRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventoryController {

    private final LoHangRepository loHangRepository;

    // 1. Lấy toàn bộ danh sách lô hàng trong kho
    @GetMapping
    public ResponseEntity<List<LoHang>> layTatCaTonKho() {
        return ResponseEntity.ok(loHangRepository.findAll());
    }

    // 2. Cảnh báo hàng sắp hết số lượng (Tồn kho <= 10)
    // Lễ tân/Quản lý gọi hàm này để biết cần nhập thêm hàng gì
    @GetMapping("/warnings/low-stock")
    public ResponseEntity<List<LoHang>> canhBaoHetHang() {
        // Lấy các mặt hàng còn dưới 10 sản phẩm
        List<LoHang> danhSachCanhBao = loHangRepository.findBySoLuongTonLessThanEqual(10);
        return ResponseEntity.ok(danhSachCanhBao);
    }

    // 3. Cảnh báo hàng sắp hết hạn sử dụng (Trong vòng 30 ngày tới)
    @GetMapping("/warnings/expiring-soon")
    public ResponseEntity<List<LoHang>> canhBaoHetHan() {
        // Lấy mốc thời gian là 30 ngày kể từ hôm nay
        LocalDate ngayCanhBao = LocalDate.now().plusDays(30);

        List<LoHang> danhSachSapHetHan = loHangRepository.canhBaoHetHan(ngayCanhBao);
        return ResponseEntity.ok(danhSachSapHetHan);
    }
}