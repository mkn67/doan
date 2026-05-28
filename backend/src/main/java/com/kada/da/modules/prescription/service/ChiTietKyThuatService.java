package com.kada.da.modules.prescription.service;

import com.kada.da.modules.prescription.dto.ChiTietKyThuatRequestDTO;
import com.kada.da.modules.prescription.dto.ChiTietKyThuatResponseDTO;

public interface ChiTietKyThuatService {
    ChiTietKyThuatResponseDTO saveKyThuat(ChiTietKyThuatRequestDTO request);
}
