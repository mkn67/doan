package com.kada.da.modules.booking.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.domain.Page;

import com.kada.da.modules.booking.domain.LichHen;
import com.kada.da.modules.booking.dto.LichHenFilterDTO;

public interface LichHenRepositoryCustom {

    String datLichHen(String maKh, String maNs, String maGoi, LocalDate ngayHen, LocalDateTime gioHen);

    void huyLichHen(String maLh);

    Page<LichHen> findAllWithFilter(LichHenFilterDTO filter);
}
