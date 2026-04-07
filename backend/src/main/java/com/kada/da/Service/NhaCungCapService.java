package com.kada.da.Service;

import com.kada.da.Dto.NhaCungCapRequestDTO;
import com.kada.da.Dto.Response.NhaCungCapResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;

public interface NhaCungCapService {
    NhaCungCapResponseDTO createNhaCungCap(NhaCungCapRequestDTO request);

    NhaCungCapResponseDTO updateNhaCungCap(String maNcc, NhaCungCapRequestDTO request);

    NhaCungCapResponseDTO getNhaCungCapById(String maNcc);

    PageResponseDTO<NhaCungCapResponseDTO> getAllNhaCungCap(int page, int size, String keyword);
}