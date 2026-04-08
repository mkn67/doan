package com.kada.da.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class XuLyKinhResponseDTO {
    private String maXl; // Mã xử lý kính (khớp với entity)
    private String maDon; // Mã hóa đơn
    private String maHoso; // Mã hồ sơ thị lực
    private String tenKhachHang; // Tên khách hàng (lấy từ hóa đơn)
    private String tenKyThuatVien; // Tên kỹ thuật viên phụ trách
    private String tinhTrang; // Trạng thái (Chờ xử lý, Đang mài, Chờ lắp, Đã xong, Đã giao, Đã hủy)
    private LocalDateTime ngayNhan; // Ngày nhận kính
    private LocalDateTime ngayHenTra; // Ngày hẹn trả
    private String ghiChu; // Ghi chú
    private Object thongSoKinh;
}