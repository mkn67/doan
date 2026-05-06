package com.kada.da.modules.examination.service;

import com.kada.da.modules.examination.dto.DanhGiaRequestDTO;
import com.kada.da.modules.examination.dto.DanhGiaResponseDTO;
import com.kada.da.modules.staff.dto.PageResponseDTO;
import java.util.List;

public interface DanhGiaService {
    DanhGiaResponseDTO createDanhGia(DanhGiaRequestDTO request);

    DanhGiaResponseDTO getDanhGiaById(String maDg);

    PageResponseDTO<DanhGiaResponseDTO> getAllDanhGia(int page, int size);

    DanhGiaResponseDTO getDanhGiaByMaHoso(String maHoso);

    List<DanhGiaResponseDTO> getDanhGiaByMaKh(String maKh);

    List<DanhGiaResponseDTO> getDanhGiaByMaNs(String maNs);

    List<DanhGiaResponseDTO> getDanhGiaBySoSao(Integer soSao);

    List<DanhGiaResponseDTO> getDanhGiaHienThi();

    List<DanhGiaResponseDTO> getDanhGiaGanDay(int days);

    DanhGiaResponseDTO updateDanhGia(String maDg, DanhGiaRequestDTO request);

    DanhGiaResponseDTO toggleHidden(String maDg, boolean hidden);

    void deleteDanhGia(String maDg);

    Double getTrungBinhSaoByBacSi(String maNs);

    Object getTyLeDanhGia();
}