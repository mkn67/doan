package com.kada.da.Service;

import com.kada.da.Dto.LichLamViecRequestDTO;
import com.kada.da.Dto.Response.LichLamViecResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;

import java.time.LocalDate;
import java.util.List;

public interface LichLamViecService {

    // =========================================================
    // 1. DÙNG STORED PROCEDURE (Tạo mới)
    // =========================================================
    // Đã đổi tên hàm và kiểu trả về thành void cho khớp với Impl
    void taoLichLamViec(LichLamViecRequestDTO request);

    // Đã đổi kiểu trả về thành void cho khớp với Impl
    void createLichLamViecBatch(List<LichLamViecRequestDTO> requests);

    // =========================================================
    // 2. DÙNG JPA BÌNH THƯỜNG (Tra cứu, Cập nhật, Xóa)
    // =========================================================
    LichLamViecResponseDTO getLichLamViecById(String maLlv);

    PageResponseDTO<LichLamViecResponseDTO> getAllLichLamViec(int page, int size);

    List<LichLamViecResponseDTO> getLichLamViecByNhanSu(String maNs);

    List<LichLamViecResponseDTO> getLichLamViecByNhanSuAndDateRange(String maNs, LocalDate fromDate, LocalDate toDate);

    List<LichLamViecResponseDTO> getLichLamViecByNgay(LocalDate ngay);

    List<LichLamViecResponseDTO> getLichLamViecByKhungGio(Double gioBatDau, Double gioKetThuc);

    boolean isNhanSuRanh(String maNs, LocalDate ngay, Double gioBatDau);

    List<LichLamViecResponseDTO> getNhanSuRanh(LocalDate ngay, Double gioBatDau);

    LichLamViecResponseDTO updateLichLamViec(String maLlv, LichLamViecRequestDTO request);

    void deleteLichLamViec(String maLlv);
}