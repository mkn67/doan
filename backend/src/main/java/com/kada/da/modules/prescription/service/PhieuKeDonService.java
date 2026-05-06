package com.kada.da.modules.prescription.service;

import com.kada.da.modules.prescription.domain.PhieuKeDon;
import java.util.List;

public interface PhieuKeDonService {
    PhieuKeDon taoDonThuoc(PhieuKeDon phieuKeDon);

    List<PhieuKeDon> layDonThuocTheoHoSo(String maHoSo);
}