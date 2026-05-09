package com.kada.da.modules.booking.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.kada.da.modules.booking.dto.DatLichResponseDTO;
import com.kada.da.modules.booking.dto.HangChoResponseDTO;
import com.kada.da.modules.booking.dto.LichHenFilterDTO;
import com.kada.da.modules.booking.dto.LichHenResponseDTO;
import com.kada.da.modules.booking.dto.LichHenTrieuChungDto;
import com.kada.da.modules.staff.dto.PageResponseDTO;

public interface LichHenService {

    DatLichResponseDTO datLichHen(String maKh, String maNs, String maGoi, LocalDate ngayHen, LocalDateTime gioHen);

    void huyLichHen(String maLh);

    LichHenResponseDTO confirmLichHen(String maLichHen);

    HangChoResponseDTO checkIn(String maLichHen);

    List<LichHenTrieuChungDto> getLichHenKemTrieuChung();

    PageResponseDTO<LichHenResponseDTO> getAllLichHen(LichHenFilterDTO filter);
}
