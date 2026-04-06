package com.kada.da.Enum;

import lombok.Getter;

@Getter
public enum TrangThaiHoaDon {
    CHUA_THANH_TOAN("Chưa thanh toán"),
    DA_THANH_TOAN("Đã thanh toán"),
    DA_HUY("Đã hủy");

    private final String value;

    TrangThaiHoaDon(String value) {
        this.value = value;
    }
}