package com.kada.da.modules.inventory.Enum;

import lombok.Getter;

@Getter
public enum TrangThaiSanPham {
    DANG_BAN("Đang bán"),
    NGUNG_KINH_DOANH("Ngừng kinh doanh"),
    HET_HANG("Hết hàng");

    private final String value;

    TrangThaiSanPham(String value) {
        this.value = value;
    }
}