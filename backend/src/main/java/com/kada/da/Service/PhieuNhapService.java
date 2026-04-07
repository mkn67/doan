package com.kada.da.Service;

import com.kada.da.Dto.PhieuNhapRequestDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Dto.Response.PhieuNhapResponseDTO;

import java.util.List;

public interface PhieuNhapService {
    PhieuNhapResponseDTO createPhieuNhap(PhieuNhapRequestDTO request);

    PhieuNhapResponseDTO getPhieuNhapById(String maPn);

    PageResponseDTO<PhieuNhapResponseDTO> getAllPhieuNhap(int page, int size);

    List<PhieuNhapResponseDTO> getPhieuNhapByNhaCungCap(String maNcc);
}