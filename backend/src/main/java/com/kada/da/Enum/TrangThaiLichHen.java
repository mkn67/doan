package com.kada.da.Enum;

import com.fasterxml.jackson.annotation.JsonValue;

import lombok.Getter;

@Getter
public enum TrangThaiLichHen {
    CHO_XAC_NHAN("Chờ xác nhận"),
    DA_XAC_NHAN("Đã xác nhận"),
    DA_CHECK_IN("Đã check-in"),
    DA_HUY("Đã hủy");

    @JsonValue
    private final String value;

    TrangThaiLichHen(String value) {
        this.value = value;
    }
}