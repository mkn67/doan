package com.kada.da.modules.booking.Enum;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import lombok.Getter;

@Getter
public enum TrangThaiLichHen {
    CHO_XAC_NHAN("Chờ xác nhận"),
    DA_XAC_NHAN("Đã xác nhận"),
    DA_CHECK_IN("Đã check-in"),
    HOAN_THANH("Hoàn thành"), 
    DA_HUY("Đã hủy");

    @JsonValue
    private final String label;

    TrangThaiLichHen(String label) {
        this.label = label;
    }

    @JsonCreator
    public static TrangThaiLichHen fromValue(String value) {
        if (value == null) return null;
        // Tẩy xóa các ký tự lỗi encoding nếu có
        String normalized = value.replace("??", "Đ");
        for (TrangThaiLichHen b : TrangThaiLichHen.values()) {
            // So sánh chuỗi đã tẩy lỗi với label
            if (b.label.equals(value) || b.label.equals(normalized)) {
                return b;
            }
        }
        // Fallback nếu vẫn không tìm ra
        System.err.println("CẢNH BÁO: Không map được giá trị: " + value);
        throw new IllegalArgumentException("Không tìm thấy trạng thái: " + value);
    }

    public static TrangThaiLichHen safeValueOf(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        String normalized = value.trim().toUpperCase();
        
        switch (normalized) {
            case "CHUA_XAC_NHAN":
            case "CHO_XAC_NHAN":
                return CHO_XAC_NHAN;
            case "DA_XAC_NHAN":
                return DA_XAC_NHAN;
            case "DA_DEN":
            case "DA_CHECK_IN":
                return DA_CHECK_IN;
            case "HOAN_THANH":
            case "DA_KHAM":
                return HOAN_THANH;
            case "DA_HUY":
                return DA_HUY;
            default:
                try {
                    return TrangThaiLichHen.valueOf(normalized);
                } catch (Exception e) {
                    try {
                        return fromValue(value);
                    } catch (Exception ex) {
                        return null;
                    }
                }
        }
    }
}