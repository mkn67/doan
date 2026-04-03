package com.kada.da.Service;

import com.kada.da.Dto.Response.LichHenResponseDTO;
import com.kada.da.Dto.LichHenRequestDTO;
import com.kada.da.Entity.HangCho;

public interface LichHenService {
    LichHenResponseDTO createLichHen(LichHenRequestDTO requestDTO);

    LichHenResponseDTO confirmLichHen(String maLichHen);

    void cancelLichHen(String maLichHen, String lyDo);

    HangCho checkIn(String maLichHen);
}
