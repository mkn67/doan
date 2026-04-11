package com.kada.da.Service.impl;

import com.kada.da.Repository.HangChoRepository;
import com.kada.da.Service.HangChoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class HangChoServiceImpl implements HangChoService {

    private final HangChoRepository hangChoRepository;

    @Override
    @Transactional
    public void capNhatTrangThaiHangCho(String maHc, String trangThai, LocalDateTime gioVaoKham) {
        log.info("Gọi SP_CAP_NHAT_HANG_CHO: mã HC={}, trạng thái mới={}, giờ vào khám={}",
                maHc, trangThai, gioVaoKham);

        // Convert LocalDateTime (Java) sang Timestamp (Oracle JDBC)
        java.sql.Timestamp timestampOracle = (gioVaoKham != null) ? java.sql.Timestamp.valueOf(gioVaoKham) : null;

        // Gọi thẳng xuống DB, Oracle sẽ tự xử lý báo lỗi nếu sai luồng trạng thái
        hangChoRepository.capNhatHangCho(maHc, trangThai, timestampOracle);

        log.info("Cập nhật hàng chờ thành công!");
    }
}