package com.kada.da.modules.booking.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface LichHenRepositoryCustom {
    String datLichHen(String maKh, String maNs, String maGoi, LocalDate ngayHen, LocalDateTime gioHen);

    void huyLichHen(String maLh);
}