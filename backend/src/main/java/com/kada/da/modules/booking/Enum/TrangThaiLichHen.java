package com.kada.da.modules.booking.Enum;

import com.fasterxml.jackson.annotation.JsonValue;

import lombok.Getter;

@Getter
public enum TrangThaiLichHen {
    CHO_XAC_NHAN("Chờ xác nhận"), // Thay thế cho chữ "Mới"
    DA_XAC_NHAN("Đã xác nhận"),
    DA_CHECK_IN("Đã check-in"), // Có thể dùng thay cho "Đang chờ"
    HOAN_THANH("Đã khám"), // BỔ SUNG CÁI NÀY ĐỂ MAP VỚI DỮ LIỆU CŨ
    DA_HUY("Đã hủy");

    @JsonValue
    private final String value;

    TrangThaiLichHen(String value) {
        this.value = value;
    }
}
