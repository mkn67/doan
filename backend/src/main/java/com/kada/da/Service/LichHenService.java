package com.kada.da.Service;

import com.kada.da.Dto.Response.HangChoResponseDTO;
import com.kada.da.Dto.Response.LichHenResponseDTO;
import com.kada.da.Dto.LichHenRequestDTO;

public interface LichHenService {
    LichHenResponseDTO createLichHen(LichHenRequestDTO requestDTO);

    LichHenResponseDTO confirmLichHen(String maLichHen);

    void cancelLichHen(String maLichHen, String lyDo);

    HangChoResponseDTO checkIn(String maLichHen);
}
