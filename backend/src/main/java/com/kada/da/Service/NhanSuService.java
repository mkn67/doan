package com.kada.da.Service;

import com.kada.da.Dto.NhanSuRequestDTO;
import com.kada.da.Dto.Response.NhanSuResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;

public interface NhanSuService {
    NhanSuResponseDTO createNhanSu(NhanSuRequestDTO request);

    NhanSuResponseDTO updateNhanSu(String maNs, NhanSuRequestDTO request);

    NhanSuResponseDTO getNhanSuById(String maNs);

    PageResponseDTO<NhanSuResponseDTO> getAllNhanSu(int page, int size, String keyword);
}