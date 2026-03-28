package com.kada.da.Mapper;

import com.kada.da.Dto.TaiKhoanRequestDTO;
import com.kada.da.Entity.Nhom;
import com.kada.da.Entity.TaiKhoan;

public class TaiKhoanMapper {
    public static TaiKhoan toEntity(TaiKhoanRequestDTO dto) {
        TaiKhoan taiKhoan = new TaiKhoan();
        taiKhoan.setMaTk(dto.getMaTk());
        taiKhoan.setUsername(dto.getUsername());
        taiKhoan.setPassword(dto.getPassword());
        if (dto.getMaNhom() != null && !dto.getMaNhom().isEmpty()) {
            Nhom nhom = new Nhom();
            nhom.setMaNhom(dto.getMaNhom());
            taiKhoan.setNhom(nhom);
        }
        return taiKhoan;
    }
}