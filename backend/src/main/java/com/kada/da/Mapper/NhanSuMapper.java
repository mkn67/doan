package com.kada.da.Mapper;

import com.kada.da.Dto.NhanSuRequestDTO;
import com.kada.da.Dto.Response.NhanSuResponseDTO;
import com.kada.da.Dto.Response.TaiKhoanResponseDTO;
import com.kada.da.Entity.NhanSu;

public class NhanSuMapper {

    /**
     * Chuyển từ RequestDTO sang Entity (chỉ các trường cơ bản, không xử lý quan hệ)
     */
    public static NhanSu toEntity(NhanSuRequestDTO dto) {
        if (dto == null)
            return null;
        return NhanSu.builder()
                .maNs(dto.getMaNs()) // có thể null khi thêm mới
                .hoTen(dto.getHoTen())
                .sdt(dto.getSdt())
                .diaChi(dto.getDiaChi())
                .ngaySinh(dto.getNgaySinh())
                .gioiTinh(dto.getGioiTinh())
                .cccd(dto.getCccd())
                // ChuyenKhoa không có trong DTO, giữ null
                .chuyenKhoa(null)
                // Mặc định chưa bị xóa
                .isDeleted(0)
                // Các quan hệ (taiKhoan, chucVu) sẽ được set riêng trong service
                .build();
    }

    /**
     * Chuyển từ Entity sang ResponseDTO
     */
    public static NhanSuResponseDTO toResponse(NhanSu entity) {
        if (entity == null)
            return null;

        // Lấy thông tin tài khoản (nếu có)
        TaiKhoanResponseDTO taiKhoanDTO = null;
        if (entity.getTaiKhoan() != null) {
            taiKhoanDTO = TaiKhoanMapper.toResponse(entity.getTaiKhoan());
        }

        // Lấy tên chức vụ (nếu có)
        String tenChucVu = null;
        if (entity.getChucVu() != null) {
            tenChucVu = entity.getChucVu().getTenCv();
        }

        // Email: Nếu không có trong entity, có thể lấy từ username của tài khoản (nếu
        // username là email)
        String email = null;
        if (entity.getTaiKhoan() != null) {
            email = entity.getTaiKhoan().getUsername(); // Giả sử username là email
        }

        return NhanSuResponseDTO.builder()
                .maNs(entity.getMaNs())
                .hoTen(entity.getHoTen())
                .sdt(entity.getSdt())
                .email(email)
                .diaChi(entity.getDiaChi())
                .ngaySinh(entity.getNgaySinh())
                .gioiTinh(entity.getGioiTinh())
                .tenChucVu(tenChucVu)
                .cccd(entity.getCccd())
                .taiKhoan(taiKhoanDTO)
                .build();
    }
}