package com.kada.da.modules.staff.service;

import java.util.List;

import com.kada.da.modules.staff.dto.NhanSuRequestDTO;
import com.kada.da.modules.staff.dto.NhanSuResponseDTO;
import com.kada.da.modules.staff.dto.PageResponseDTO;
import com.kada.da.modules.report.dto.TopBacSiDTO;

public interface NhanSuService {
    NhanSuResponseDTO createNhanSu(NhanSuRequestDTO request);

    NhanSuResponseDTO updateNhanSu(String maNs, NhanSuRequestDTO request);

    NhanSuResponseDTO getNhanSuById(String maNs);

    PageResponseDTO<NhanSuResponseDTO> getAllNhanSu(int page, int size, String keyword);

    List<TopBacSiDTO> getTopBacSiRating();
}