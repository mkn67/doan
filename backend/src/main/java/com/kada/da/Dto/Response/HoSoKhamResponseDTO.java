package com.kada.da.Dto.Response;

import com.kada.da.Dto.ChiTietThiLucDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoSoKhamResponseDTO {
    private String maHoSo;
    private String maKh;
    private String tenKhachHang;
    private String tenBacSi;
    private LocalDateTime ngayKham;

    private String trieuChung;
    private String ketLuan;

    private List<ChiTietThiLucDTO> danhSachThiLuc;

    private String maDonThuoc;
}