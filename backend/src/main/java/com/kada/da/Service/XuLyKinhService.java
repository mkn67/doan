package com.kada.da.Service;

import com.kada.da.Dto.XuLyKinhRequestDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Dto.Response.XuLyKinhResponseDTO;

import java.util.List;

public interface XuLyKinhService {

    // 1. Khởi tạo / Lấy chi tiết / Danh sách
    XuLyKinhResponseDTO createXuLyKinh(XuLyKinhRequestDTO request);

    XuLyKinhResponseDTO getXuLyKinhById(String maXl);

    PageResponseDTO<XuLyKinhResponseDTO> getAllXuLyKinh(int page, int size);

    // 2. Nhóm nghiệp vụ truy vấn (Bộ lọc)
    List<XuLyKinhResponseDTO> getXuLyKinhByMaDon(String maDon);

    List<XuLyKinhResponseDTO> getXuLyKinhByTrangThai(String trangThai);

    List<XuLyKinhResponseDTO> getXuLyKinhCanXuLy();

    List<XuLyKinhResponseDTO> getXuLyKinhByKyThuatAndTrangThai(String maKyThuat, String trangThai);

    // 3. Nhóm cập nhật dữ liệu / Thông số
    XuLyKinhResponseDTO updateThongSoKinh(String maXl, Object thongSoKinh); // Ghi chú: Object sau này có thể đổi thành
                                                                            // 1 class JSON cụ thể nếu cần

    XuLyKinhResponseDTO updateTrangThai(String maXl, String trangThai);

    // 4. Nhóm Action Workflow (Luồng công việc của kỹ thuật viên)
    XuLyKinhResponseDTO batDauXuLy(String maXl, String maKyThuat);

    XuLyKinhResponseDTO hoanThanhXuLy(String maXl);

    XuLyKinhResponseDTO huyXuLy(String maXl, String lyDo);
}