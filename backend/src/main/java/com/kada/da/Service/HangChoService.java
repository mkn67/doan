package com.kada.da.Service;

import java.time.LocalDateTime;

public interface HangChoService {
    // ... Các hàm cũ nếu có

    // Thêm hàm gọi SP
    void capNhatTrangThaiHangCho(String maHc, String trangThai, LocalDateTime gioVaoKham);
}