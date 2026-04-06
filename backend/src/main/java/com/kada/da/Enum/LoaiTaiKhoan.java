package com.kada.da.Enum;

import lombok.Getter;

@Getter
public enum LoaiTaiKhoan {
    INTERNAL("INTERNAL"), // Nhân sự
    EXTERNAL("EXTERNAL"); // Khách hàng

    private final String value;

    LoaiTaiKhoan(String value) {
        this.value = value;
    }
}