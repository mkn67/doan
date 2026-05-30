package com.kada.da.modules.examination.service;

import com.kada.da.modules.examination.dto.HoSoKhamRequestDTO;
import java.util.Map;

public interface ClinicService {
    /**
     * Khám bệnh & Lưu/Cập nhật hồ sơ bệnh án
     * - Xác thực dữ liệu đầu vào nghiêm ngặt.
     * - Kiểm tra & phân loại Khám lần đầu (firstExamination) vs Tái khám (reExamination).
     * - Cập nhật & So sánh phiên bản (Version Diffing), lưu lịch sử vào AUDIT_HOSO_THILUC.
     * - Ghi vết nhật ký hoạt động bảo mật (Audit Log) cho các thao tác tạo mới/cập nhật.
     * - Tự động liên kết xuống xưởng mài lắp kính (XU_LY_KINH) nếu điền Đơn kính gia công.
     */
    Map<String, Object> saveExamination(HoSoKhamRequestDTO req);

    /**
     * Xóa hồ sơ khám bệnh
     * - Ghi vết nhật ký hoạt động bảo mật (Audit Log).
     * - Xóa an toàn các ràng buộc liên quan để bảo toàn tính toàn vẹn dữ liệu.
     */
    void deleteExamination(String maHoSo, String username);
}
