package com.kada.da.Service;

import com.kada.da.Dto.PhieuNhapRequestDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Dto.Response.PhieuNhapResponseDTO;

import java.util.List;

public interface PhieuNhapService {

    // =========================================================
    // 1. NGHIỆP VỤ NHẬP KHO (GỌI SP MỚI)
    // =========================================================
    PhieuNhapResponseDTO nhapKhoHoanChinh(PhieuNhapRequestDTO request);

    // =========================================================
    // 2. NGHIỆP VỤ TRA CỨU (GIỮ NGUYÊN CỦA ÔNG)
    // =========================================================
    PhieuNhapResponseDTO getPhieuNhapById(String maPn);

    PageResponseDTO<PhieuNhapResponseDTO> getAllPhieuNhap(int page, int size);

    List<PhieuNhapResponseDTO> getPhieuNhapByNhaCungCap(String maNcc);

}