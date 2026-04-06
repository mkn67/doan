package com.kada.da.Enum;

import lombok.Getter;

@Getter
public enum TrangThaiHangCho {
    DANG_CHO("Đang chờ"),
    DANG_KHAM("Đang khám"),
    HOAN_THANH("Hoàn thành"),
    BO_QUA("Bỏ qua");

    private final String value;

    TrangThaiHangCho(String value) {
        this.value = value;
    }
}