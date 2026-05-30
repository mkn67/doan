package com.kada.da.modules.inventory.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.modules.inventory.dto.LoHangResponseDTO;
import com.kada.da.modules.inventory.service.LoHangService;
import com.kada.da.modules.staff.dto.PageResponseDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'THU_KHO')")
public class InventoryController {

    private final LoHangService loHangService;

    // 1. Lấy toàn bộ danh sách lô hàng trong kho (Đã nâng cấp lên phân trang)
    @GetMapping
    public ResponseEntity<PageResponseDTO<LoHangResponseDTO>> layTatCaTonKho(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(loHangService.getAllLoHang(page, size));
    }

    // 2. Cảnh báo hàng sắp hết số lượng (Tồn kho <= 10)
    // Tớ thêm param 'nguong' để sau này Frontend có thể tự chỉnh cảnh báo <= 5 hay
    // <= 20
    @GetMapping("/warnings/low-stock")
    public ResponseEntity<List<LoHangResponseDTO>> canhBaoHetHang(
            @RequestParam(defaultValue = "10") int nguong) {
        return ResponseEntity.ok(loHangService.getLoHangSapHetSoLuong(nguong));
    }

    // 3. Cảnh báo hàng sắp hết hạn sử dụng (Trong vòng 30 ngày tới)
    @GetMapping("/warnings/expiring-soon")
    public ResponseEntity<List<LoHangResponseDTO>> canhBaoHetHan() {
        return ResponseEntity.ok(loHangService.getLoHangSapHetHan());
    }
}
