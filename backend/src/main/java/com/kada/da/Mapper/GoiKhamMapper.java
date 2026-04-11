package com.kada.da.Mapper;

import com.kada.da.Dto.GoiKhamRequestDTO;
import com.kada.da.Dto.Response.GoiKhamResponseDTO;
import com.kada.da.Entity.GoiKham;

public class GoiKhamMapper {

    /**
     * Chuyển từ GoiKhamRequestDTO sang GoiKham entity.
     * Lưu ý: Mã gói (maGoi) sẽ được sinh trong service.
     * Danh sách dịch vụ (danhSachMaDv) không map ở đây, sẽ xử lý trong service để
     * lưu vào bảng CT_GOI_KHAM.
     * Các trường thoiLuong, isActive được set mặc định.
     */
    public static GoiKham toEntity(GoiKhamRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        return GoiKham.builder()
                .tenGoi(dto.getTenGoi())
                .gia(dto.getGiaGoi())
                .moTa(dto.getMoTa())
                .thoiLuong(30) // Mặc định 30 phút, có thể thay đổi sau
                .isActive(1) // Mặc định hoạt động
                .build();
    }

    /**
     * Chuyển từ GoiKham entity sang GoiKhamResponseDTO.
     * Danh sách chi tiết dịch vụ (chiTietDichVu) sẽ được set trong service sau khi
     * truy vấn từ CT_GOI_KHAM.
     */
    public static GoiKhamResponseDTO toResponse(GoiKham entity) {
        if (entity == null) {
            return null;
        }
        return GoiKhamResponseDTO.builder()
                .maGoi(entity.getMaGoi())
                .tenGoi(entity.getTenGoi())
                .giaGoi(entity.getGia())
                .moTa(entity.getMoTa())
                .build();
    }
}