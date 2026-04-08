package com.kada.da.Service;

import com.kada.da.Dto.LichLamViecRequestDTO;
import com.kada.da.Dto.Response.LichLamViecResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;

import java.time.LocalDate;
import java.util.List;

public interface LichLamViecService {
    LichLamViecResponseDTO createLichLamViec(LichLamViecRequestDTO request);

    LichLamViecResponseDTO getLichLamViecById(String maLlv);

    PageResponseDTO<LichLamViecResponseDTO> getAllLichLamViec(int page, int size);

    List<LichLamViecResponseDTO> getLichLamViecByNhanSu(String maNs);

    List<LichLamViecResponseDTO> getLichLamViecByNhanSuAndDateRange(String maNs, LocalDate fromDate, LocalDate toDate);

    List<LichLamViecResponseDTO> getLichLamViecByNgay(LocalDate ngay);

    // Đã đổi String ca -> Double gioBatDau, Double gioKetThuc
    List<LichLamViecResponseDTO> getLichLamViecByKhungGio(Double gioBatDau, Double gioKetThuc);

    // Đã đổi String ca -> Double gioBatDau
    boolean isNhanSuRanh(String maNs, LocalDate ngay, Double gioBatDau);

    List<LichLamViecResponseDTO> getNhanSuRanh(LocalDate ngay, Double gioBatDau);

    LichLamViecResponseDTO updateLichLamViec(String maLlv, LichLamViecRequestDTO request);

    void deleteLichLamViec(String maLlv);

    List<LichLamViecResponseDTO> createLichLamViecBatch(List<LichLamViecRequestDTO> requests);
}