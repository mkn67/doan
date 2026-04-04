package com.kada.da.Service;

import com.kada.da.Entity.PhieuKeDon;
import java.util.List;

public interface PhieuKeDonService {
    PhieuKeDon taoDonThuoc(PhieuKeDon phieuKeDon);

    List<PhieuKeDon> layDonThuocTheoKhachHang(String maKh);
}