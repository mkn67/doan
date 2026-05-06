package com.kada.da.modules.booking.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class SlotTrongDto {
    private String maNs;
    private String tenBacSi;
    private LocalDate ngayLam;
    private Double gioBatDau;
    private Double gioKetThuc;
    private String trangThaiSlot;
}