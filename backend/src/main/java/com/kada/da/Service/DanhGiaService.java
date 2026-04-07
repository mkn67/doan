package com.kada.da.Service;

import com.kada.da.Dto.DanhGiaRequestDTO;
import com.kada.da.Dto.Response.DanhGiaResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
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