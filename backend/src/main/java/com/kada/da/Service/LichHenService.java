package com.kada.da.Service;

import com.kada.da.Dto.Response.HangChoResponseDTO;
import com.kada.da.Dto.Response.LichHenResponseDTO;
import com.kada.da.Dto.Response.DatLichResponseDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface LichHenService {

    // 1. Dùng Stored Procedure (Nghiệp vụ lõi)
    DatLichResponseDTO datLichHen(String maKh, String maNs, String maGoi, LocalDate ngayHen, LocalDateTime gioHen);

    void huyLichHen(String maLh);

    // 2. Dùng JPA bình thường (Cập nhật trạng thái)
    LichHenResponseDTO confirmLichHen(String maLichHen);

    HangChoResponseDTO checkIn(String maLichHen);
}