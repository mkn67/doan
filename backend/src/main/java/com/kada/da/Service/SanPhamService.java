package com.kada.da.Service;

import com.kada.da.Dto.CanhBaoTonKhoDto;
import com.kada.da.Entity.SanPham;
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