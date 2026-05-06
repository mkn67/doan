package com.kada.da.modules.examination.service;

import com.kada.da.modules.examination.dto.GoiKhamRequestDTO;
import com.kada.da.modules.examination.dto.GoiKhamResponseDTO;
import com.kada.da.modules.staff.dto.PageResponseDTO;

public interface GoiKhamService {
    GoiKhamResponseDTO createGoiKham(GoiKhamRequestDTO request);

    GoiKhamResponseDTO getGoiKhamById(String maGoi);

    PageResponseDTO<GoiKhamResponseDTO> getAllGoiKham(int page, int size);
}