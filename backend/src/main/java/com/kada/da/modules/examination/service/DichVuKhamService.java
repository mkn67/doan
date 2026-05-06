package com.kada.da.modules.examination.service;

import com.kada.da.modules.examination.dto.DichVuKhamRequestDTO;
import com.kada.da.modules.examination.dto.DichVuKhamResponseDTO;
import com.kada.da.modules.staff.dto.PageResponseDTO;

public interface DichVuKhamService {
    DichVuKhamResponseDTO createDichVu(DichVuKhamRequestDTO request);

    DichVuKhamResponseDTO updateDichVu(String maDv, DichVuKhamRequestDTO request);

    PageResponseDTO<DichVuKhamResponseDTO> getAllDichVu(int page, int size);
}