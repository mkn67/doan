package com.kada.da.Service;

import com.kada.da.Dto.XuLyKinhRequestDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Dto.Response.XuLyKinhResponseDTO;

import java.util.List;

public interface XuLyKinhService {
    XuLyKinhResponseDTO createXuLyKinh(XuLyKinhRequestDTO request);

    XuLyKinhResponseDTO getXuLyKinhById(String maXl);

    PageResponseDTO<XuLyKinhResponseDTO> getAllXuLyKinh(int page, int size);

    List<XuLyKinhResponseDTO> getXuLyKinhByMaDon(String maDon);

    List<XuLyKinhResponseDTO> getXuLyKinhByTrangThai(String trangThai);

    List<XuLyKinhResponseDTO> getXuLyKinhCanXuLy();

    List<XuLyKinhResponseDTO> getXuLyKinhByKyThuatAndTrangThai(String maKyThuat, String trangThai);

    XuLyKinhResponseDTO updateThongSoKinh(String maXl, Object thongSoKinh);

    XuLyKinhResponseDTO updateTrangThai(String maXl, String trangThai);

    // Các thao tác nghiệp vụ đặc thù
    XuLyKinhResponseDTO batDauXuLy(String maXl, String maKyThuat);

    XuLyKinhResponseDTO hoanThanhXuLy(String maXl);

    XuLyKinhResponseDTO huyXuLy(String maXl, String lyDo);
}