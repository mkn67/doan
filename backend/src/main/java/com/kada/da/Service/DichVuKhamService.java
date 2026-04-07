package com.kada.da.Service;

import com.kada.da.Dto.DichVuKhamRequestDTO;
import com.kada.da.Dto.Response.DichVuKhamResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;

public interface DichVuKhamService {
    DichVuKhamResponseDTO createDichVu(DichVuKhamRequestDTO request);

    DichVuKhamResponseDTO updateDichVu(String maDv, DichVuKhamRequestDTO request);

    PageResponseDTO<DichVuKhamResponseDTO> getAllDichVu(int page, int size);
}