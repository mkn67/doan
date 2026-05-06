package com.kada.da.modules.auth.service;

import com.kada.da.modules.auth.dto.NhomRequestDTO;
import com.kada.da.modules.auth.dto.NhomResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.modules.auth.dto.VaiTroResponseDTO;
import java.util.List;

public interface NhomService {
    NhomResponseDTO createNhom(NhomRequestDTO request);

    NhomResponseDTO getNhomById(String maNhom);

    PageResponseDTO<NhomResponseDTO> getAllNhom(int page, int size);

    List<NhomResponseDTO> getAllNhomList();

    List<VaiTroResponseDTO> getVaiTroByNhom(String maNhom);

    NhomResponseDTO updateNhom(String maNhom, NhomRequestDTO request);

    void deleteNhom(String maNhom);

    void addVaiTroToNhom(String maNhom, String maVaiTro);

    void removeVaiTroFromNhom(String maNhom, String maVaiTro);

    void assignNhanSuToNhom(String maNhom, List<String> maNsList);

    void addNhanSuToNhom(String maNs, String maNhom); // thêm mới
}