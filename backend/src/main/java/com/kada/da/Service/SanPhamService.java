package com.kada.da.Service;

import com.kada.da.Dto.SanPhamRequestDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Dto.Response.SanPhamResponseDTO;

public interface SanPhamService {
    SanPhamResponseDTO createSanPham(SanPhamRequestDTO request);

    SanPhamResponseDTO updateSanPham(String maSp, SanPhamRequestDTO request);

    SanPhamResponseDTO getSanPhamById(String maSp);

    PageResponseDTO<SanPhamResponseDTO> getAllSanPham(int page, int size, Boolean laThuoc, String keyword);
}