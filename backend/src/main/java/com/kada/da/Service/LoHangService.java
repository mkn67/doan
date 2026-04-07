package com.kada.da.Service;

import com.kada.da.Dto.LoHangRequestDTO;
import com.kada.da.Dto.Response.LoHangResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;

import java.util.List;

public interface LoHangService {

    // 1. Quản lý cơ bản
    LoHangResponseDTO createLoHang(LoHangRequestDTO request);

    LoHangResponseDTO getLoHangById(String maLo);

    PageResponseDTO<LoHangResponseDTO> getAllLoHang(int page, int size);

    // 2. Nghiệp vụ Kho (Inventory)
    List<LoHangResponseDTO> getLoHangBySanPham(String maSp);

    List<LoHangResponseDTO> getLoHangConTon();

    // 3. Nghiệp vụ Cảnh báo (Phục vụ cho InventoryController)
    List<LoHangResponseDTO> getLoHangSapHetHan();

    List<LoHangResponseDTO> getLoHangSapHetSoLuong(int nguong);

    // 4. Nghiệp vụ Bán hàng / Xuất kho
    LoHangResponseDTO updateSoLuongTon(String maLo, Integer soLuongBan);
}