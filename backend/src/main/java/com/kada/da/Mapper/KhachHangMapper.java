package com.kada.da.Mapper;

import com.kada.da.Dto.KhachHangRequestDTO;
import com.kada.da.Dto.Response.KhachHangResponseDTO;
import com.kada.da.Entity.KhachHang;

public class KhachHangMapper {

    public static KhachHang toEntity(KhachHangRequestDTO dto) {
        if (dto == null)
            return null;
        return KhachHang.builder()
                .hoTen(dto.getHoTen())
                .sdt(dto.getSdt())
                .diaChi(dto.getDiaChi())
                // Các trường không có trong DTO sẽ được set mặc định hoặc null
                .cccd(null)
                .ngaySinh(null)
                .gioiTinh(null)
                .diemTichLuy(0)
                .isDeleted(0)
                .build();
        // Lưu ý: maKh và taiKhoan sẽ được set trong service
    }

    public static KhachHangResponseDTO toResponse(KhachHang entity) {
        if (entity == null)
            return null;

        // Lấy email từ tài khoản (username giả định là email)
        String email = entity.getTaiKhoan() != null ? entity.getTaiKhoan().getUsername() : null;

        return KhachHangResponseDTO.builder()
                .maKh(entity.getMaKh())
                .hoTen(entity.getHoTen())
                .sdt(entity.getSdt())
                .email(email)
                .diaChi(entity.getDiaChi())
                // Các trường thống kê (ngayTao, tongSoLanKham, tongChiTieu, lichHenGanNhat) sẽ
                // được set trong service
                .build();
    }
}