package com.kada.da.Service;

import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Dto.Response.XuLyKinhResponseDTO;
import com.kada.da.Dto.XuLyKinhRequestDTO;

import java.util.List;

public interface XuLyKinhService {

    // =========================================================
    // 1. NGHIỆP VỤ LÕI (DÙNG STORED PROCEDURE)
    // =========================================================
    String taoPhieuGiaoKinh(String maDon, String maNsKyThuat, String thongSoKinh);

    // =========================================================
    // 2. NGHIỆP VỤ TRA CỨU (DÙNG JPA)
    // =========================================================
    XuLyKinhResponseDTO getXuLyKinhById(String maXl);

    PageResponseDTO<XuLyKinhResponseDTO> getAllXuLyKinh(int page, int size);

    List<XuLyKinhResponseDTO> getXuLyKinhByMaDon(String maDon);

    List<XuLyKinhResponseDTO> getXuLyKinhByTrangThai(String trangThai);

    List<XuLyKinhResponseDTO> getXuLyKinhCanXuLy();

    List<XuLyKinhResponseDTO> getXuLyKinhByKyThuatAndTrangThai(String maKyThuat, String trangThai);

    // =========================================================
    // 3. NGHIỆP VỤ CẬP NHẬT TRẠNG THÁI (DÙNG JPA)
    // =========================================================
    XuLyKinhResponseDTO updateThongSoKinh(String maXl, Object thongSoKinh);

    XuLyKinhResponseDTO updateTrangThai(String maXl, String trangThai);

    XuLyKinhResponseDTO batDauXuLy(String maXl, String maKyThuat);

    XuLyKinhResponseDTO hoanThanhXuLy(String maXl);

    XuLyKinhResponseDTO huyXuLy(String maXl, String lyDo);

    // =========================================================
    // HÀM CŨ BỊ ĐÀO THẢI (Giữ lại để Impl ném Exception)
    // =========================================================
    XuLyKinhResponseDTO createXuLyKinh(XuLyKinhRequestDTO request);
}