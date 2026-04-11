package com.kada.da.Mapper;

import com.kada.da.Dto.TaiKhoanRequestDTO;
import com.kada.da.Dto.Response.TaiKhoanResponseDTO;
import com.kada.da.Entity.Nhom;
import com.kada.da.Entity.TaiKhoan;
import java.util.ArrayList;
import java.util.List;

public class TaiKhoanMapper {
    public static TaiKhoan toEntity(TaiKhoanRequestDTO dto) {
        TaiKhoan taiKhoan = new TaiKhoan();
        taiKhoan.setMaTk(dto.getMaTk());
        taiKhoan.setUsername(dto.getUsername()); // Sửa tên
        taiKhoan.setPassword(dto.getPassword()); // Sửa tên

        // Chuyển 1 mã nhóm từ DTO thành một List<Nhom> cho Entity
        if (dto.getMaNhom() != null && !dto.getMaNhom().isEmpty()) {
            Nhom nhom = new Nhom();
            nhom.setMaNhom(dto.getMaNhom());

            List<Nhom> danhSachNhom = new ArrayList<>();
            danhSachNhom.add(nhom);

            taiKhoan.setDanhSachNhom(danhSachNhom);
        }
        return taiKhoan;
    }

    public static TaiKhoanResponseDTO toResponse(TaiKhoan taiKhoan) {
        if (taiKhoan == null)
            return null;
        return TaiKhoanResponseDTO.builder()
                .maTk(taiKhoan.getMaTk())
                .username(taiKhoan.getUsername())
                .loaiTk(taiKhoan.getLoaiTk())
                .trangThai(taiKhoan.getTrangThai())
                .build();
    }
}