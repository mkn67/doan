package com.kada.da.Service;

import com.kada.da.Dto.HangChoHomNayDto;
import java.time.LocalDateTime;
import java.util.List;

public interface HangChoService {
    // ... Các hàm cũ nếu có

    // Thêm hàm gọi SP
    void capNhatTrangThaiHangCho(String maHc, String trangThai, LocalDateTime gioVaoKham);

    List<HangChoHomNayDto> getHangChoHomNay();
}