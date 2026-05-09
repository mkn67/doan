package com.kada.da.modules.booking.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.kada.da.modules.booking.dto.DatLichResponseDTO;
import com.kada.da.modules.booking.dto.HangChoResponseDTO;
import com.kada.da.modules.booking.dto.LichHenResponseDTO;
import com.kada.da.modules.booking.dto.LichHenTrieuChungDto;
import com.kada.da.modules.staff.dto.PageResponseDTO;

public interface LichHenService {

    // 1. Dùng Stored Procedure (Nghiệp vụ lõi)
    DatLichResponseDTO datLichHen(String maKh, String maNs, String maGoi, LocalDate ngayHen, LocalDateTime gioHen);

    void huyLichHen(String maLh);

    // 2. Dùng JPA bình thường (Cập nhật trạng thái)
    LichHenResponseDTO confirmLichHen(String maLichHen);

    HangChoResponseDTO checkIn(String maLichHen);

    List<LichHenTrieuChungDto> getLichHenKemTrieuChung();

    PageResponseDTO<LichHenResponseDTO> getAllLichHen(int page, int size);
}
