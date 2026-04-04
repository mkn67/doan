package com.kada.da.Service;

import com.kada.da.Entity.SanPham;
import java.util.List;

public interface SanPhamService {
    List<SanPham> layTatCaSanPham();

    List<SanPham> timTheoLoai(String maLoai);

    SanPham capNhatGia(String maSp, Double giaMoi);
}