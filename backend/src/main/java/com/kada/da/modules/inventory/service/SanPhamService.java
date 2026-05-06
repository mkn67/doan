package com.kada.da.modules.inventory.service;

import com.kada.da.modules.inventory.dto.CanhBaoTonKhoDto;
import com.kada.da.modules.inventory.domain.SanPham;
import java.util.List;

public interface SanPhamService {
    SanPham createSanPham(SanPham sanPham);

    SanPham updateSanPham(String maSp, SanPham sanPham);

    void deleteSanPham(String maSp);

    SanPham getSanPhamById(String maSp);

    List<SanPham> getAllSanPham();

    List<SanPham> getDanhSachThuoc();

    List<CanhBaoTonKhoDto> getCanhBaoTonKho();
}