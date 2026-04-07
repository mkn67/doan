package com.kada.da.Service;

import com.kada.da.Dto.VaiTroRequestDTO;
import com.kada.da.Dto.Response.NhomResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Dto.Response.VaiTroResponseDTO;
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