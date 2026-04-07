package com.kada.da.Service;

import com.kada.da.Dto.GoiKhamRequestDTO;
import com.kada.da.Dto.Response.GoiKhamResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;

public interface GoiKhamService {
    GoiKhamResponseDTO createGoiKham(GoiKhamRequestDTO request);

    GoiKhamResponseDTO getGoiKhamById(String maGoi);

    PageResponseDTO<GoiKhamResponseDTO> getAllGoiKham(int page, int size);
}