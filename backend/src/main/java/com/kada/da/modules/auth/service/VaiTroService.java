package com.kada.da.modules.auth.service;

import com.kada.da.modules.auth.dto.VaiTroRequestDTO;
import com.kada.da.modules.staff.dto.NhomResponseDTO;
import com.kada.da.modules.staff.dto.PageResponseDTO;
import com.kada.da.modules.auth.dto.VaiTroResponseDTO;
import java.util.List;

public interface VaiTroService {
    VaiTroResponseDTO createVaiTro(VaiTroRequestDTO request);

    VaiTroResponseDTO getVaiTroById(String maVaiTro);

    PageResponseDTO<VaiTroResponseDTO> getAllVaiTro(int page, int size);

    List<VaiTroResponseDTO> getAllVaiTroList();

    List<NhomResponseDTO> getNhomByVaiTro(String maVaiTro);

    VaiTroResponseDTO updateVaiTro(String maVaiTro, VaiTroRequestDTO request);

    void deleteVaiTro(String maVaiTro);

    List<VaiTroResponseDTO> searchVaiTroByTen(String keyword);
}