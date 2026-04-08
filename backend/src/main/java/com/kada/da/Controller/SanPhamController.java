package com.kada.da.Controller;

import com.kada.da.Entity.SanPham;
import com.kada.da.Service.SanPhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/san-pham")
@RequiredArgsConstructor
public class SanPhamController {

    private final SanPhamService sanPhamService;

    // 1. Lấy danh sách tất cả sản phẩm
    @GetMapping
    public ResponseEntity<List<SanPham>> getAllSanPham() {
        return ResponseEntity.ok(sanPhamService.getAllSanPham());
    }

    // 2. Lấy danh sách CHỈ là thuốc (phục vụ cho việc Kê đơn)
    @GetMapping("/thuoc")
    public ResponseEntity<List<SanPham>> getDanhSachThuoc() {
        return ResponseEntity.ok(sanPhamService.getDanhSachThuoc());
    }

    // 3. Lấy 1 sản phẩm theo mã
    @GetMapping("/{maSp}")
    public ResponseEntity<SanPham> getSanPhamById(@PathVariable String maSp) {
        return ResponseEntity.ok(sanPhamService.getSanPhamById(maSp));
    }

    // 4. Tạo mới sản phẩm
    @PostMapping
    public ResponseEntity<SanPham> createSanPham(@RequestBody SanPham sanPham) {
        SanPham response = sanPhamService.createSanPham(sanPham);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 5. Cập nhật sản phẩm
    @PutMapping("/{maSp}")
    public ResponseEntity<SanPham> updateSanPham(@PathVariable String maSp, @RequestBody SanPham sanPham) {
        return ResponseEntity.ok(sanPhamService.updateSanPham(maSp, sanPham));
    }

    // 6. Xóa sản phẩm
    @DeleteMapping("/{maSp}")
    public ResponseEntity<Void> deleteSanPham(@PathVariable String maSp) {
        sanPhamService.deleteSanPham(maSp);
        return ResponseEntity.noContent().build();
    }
}