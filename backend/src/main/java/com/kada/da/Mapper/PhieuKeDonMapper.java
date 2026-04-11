package com.kada.da.Mapper;

import com.kada.da.Dto.PhieuKeDonRequestDTO;
import com.kada.da.Dto.Response.PhieuKeDonResponseDTO;
import com.kada.da.Entity.PhieuKeDon;

import java.time.LocalDateTime;

public class PhieuKeDonMapper {

    /**
     * Chuyển từ RequestDTO sang Entity.
     * Lưu ý: maDon, hoSoThiLuc, nhanSu, chiTietKeDons sẽ được set trong service.
     * Ngày kê đơn được set là thời điểm hiện tại.
     */
    public static PhieuKeDon toEntity(PhieuKeDonRequestDTO dto) {
        if (dto == null)
            return null;
        return PhieuKeDon.builder()
                .ngayKeDon(LocalDateTime.now())
                .loiDan(dto.getLoiKhuyen()) // Map loiKhuyen -> loiDan
                // Entity không có ghiChu, nếu cần thì thêm vào entity
                .build();
    }

    /**
     * Chuyển từ Entity sang ResponseDTO.
     * Danh sách chi tiết (danhSachKeDon) sẽ được set trong service.
     * Lấy tên bác sĩ, tên khách hàng từ các quan hệ.
     */
    public static PhieuKeDonResponseDTO toResponse(PhieuKeDon entity) {
        if (entity == null)
            return null;
        String tenBacSi = entity.getNhanSu() != null ? entity.getNhanSu().getHoTen() : null;
        String tenKhachHang = (entity.getHoSoThiLuc() != null && entity.getHoSoThiLuc().getKhachHang() != null)
                ? entity.getHoSoThiLuc().getKhachHang().getHoTen()
                : null;
        return PhieuKeDonResponseDTO.builder()
                .maDon(entity.getMaDon())
                .tenBacSi(tenBacSi)
                .tenKhachHang(tenKhachHang)
                .ngayKe(entity.getNgayKeDon())
                .loiKhuyen(entity.getLoiDan())
                .ghiChu(null) // Entity không có ghiChu, tạm để null; nếu cần thì thêm vào entity
                .build();
    }
}