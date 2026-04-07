package com.kada.da.Service;

import com.kada.da.Dto.LichLamViecRequestDTO;
import com.kada.da.Dto.Response.LichLamViecResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;

import java.time.LocalDate;
import java.util.List;

public interface LichLamViecService {

    // 1. Nhóm API Tạo mới / Cập nhật / Xóa
    LichLamViecResponseDTO createLichLamViec(LichLamViecRequestDTO request);

    LichLamViecResponseDTO updateLichLamViec(String maLlv, LichLamViecRequestDTO request);

    void deleteLichLamViec(String maLlv);

    List<LichLamViecResponseDTO> createLichLamViecBatch(List<LichLamViecRequestDTO> requests);

    // 2. Nhóm API Truy vấn / Lấy danh sách
    LichLamViecResponseDTO getLichLamViecById(String maLlv);

    PageResponseDTO<LichLamViecResponseDTO> getAllLichLamViec(int page, int size);

    List<LichLamViecResponseDTO> getLichLamViecByNhanSu(String maNs);

    List<LichLamViecResponseDTO> getLichLamViecByNhanSuAndDateRange(String maNs, LocalDate fromDate, LocalDate toDate);

    List<LichLamViecResponseDTO> getLichLamViecByNgay(LocalDate ngayLam);

    // 3. Nhóm API Kiểm tra tính khả dụng (Booking / Đặt lịch)
    boolean isNhanSuRanh(String maNs, LocalDate ngayLam, Double gioBatDau, Double gioKetThuc);

    List<LichLamViecResponseDTO> getNhanSuRanh(LocalDate ngayLam, Double gioBatDau, Double gioKetThuc);
}