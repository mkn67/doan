package com.kada.da.Dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LichHenTrieuChungDto {
    private String maLh;
    private LocalDateTime ngayHen;
    private String tenKhach;
    private String trangThai;
    private List<String> danhSachTrieuChung;
}
