package com.kada.da.modules.inventory.service;

import com.kada.da.modules.inventory.dto.NhaCungCapRequestDTO;
import com.kada.da.modules.inventory.dto.NhaCungCapResponseDTO;
import com.kada.da.modules.staff.dto.PageResponseDTO;

public interface NhaCungCapService {
    NhaCungCapResponseDTO createNhaCungCap(NhaCungCapRequestDTO request);

    NhaCungCapResponseDTO updateNhaCungCap(String maNcc, NhaCungCapRequestDTO request);

    NhaCungCapResponseDTO getNhaCungCapById(String maNcc);

    PageResponseDTO<NhaCungCapResponseDTO> getAllNhaCungCap(int page, int size, String keyword);
}