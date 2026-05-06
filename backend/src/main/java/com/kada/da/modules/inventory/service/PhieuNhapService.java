package com.kada.da.modules.inventory.service;

import com.kada.da.modules.inventory.dto.PhieuNhapRequestDTO;
import com.kada.da.modules.staff.dto.PageResponseDTO;
import com.kada.da.modules.inventory.dto.PhieuNhapResponseDTO;

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