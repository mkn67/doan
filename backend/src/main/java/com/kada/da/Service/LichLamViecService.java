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

    List<LichLamViecResponseDTO> getLichLamViecByCa(String ca);

    boolean isNhanSuRanh(String maNs, LocalDate ngay, String ca);

    // Thêm method này
    List<LichLamViecResponseDTO> getNhanSuRanh(LocalDate ngay, String ca);

    LichLamViecResponseDTO updateLichLamViec(String maLlv, LichLamViecRequestDTO request);

    void deleteLichLamViec(String maLlv);

    List<LichLamViecResponseDTO> createLichLamViecBatch(List<LichLamViecRequestDTO> requests);
}