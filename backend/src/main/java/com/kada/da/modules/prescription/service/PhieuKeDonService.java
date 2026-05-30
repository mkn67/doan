package com.kada.da.modules.prescription.service;

import com.kada.da.modules.prescription.dto.PhieuKeDonRequestDTO;
import com.kada.da.modules.prescription.dto.PhieuKeDonResponseDTO;
import java.util.List;

public interface PhieuKeDonService {
    PhieuKeDonResponseDTO taoDonThuoc(PhieuKeDonRequestDTO dto);

    List<PhieuKeDonResponseDTO> layDonThuocTheoHoSo(String maHoSo);
}