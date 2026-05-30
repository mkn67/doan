package com.kada.da.modules.billing.Enum;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

// autoApply = true giúp Hibernate tự động dùng cái này mỗi khi thấy TrangThaiHoaDon trong Entity
@Converter(autoApply = true)
public class TrangThaiHoaDonConverter
    implements AttributeConverter<TrangThaiHoaDon, String>
{

    @Override
    public String convertToDatabaseColumn(TrangThaiHoaDon attribute) {
        return (attribute == null) ? null : attribute.getValue();
    }

    @Override
    public TrangThaiHoaDon convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) return null;

        // Chuẩn hóa dữ liệu từ DB (xử lý khoảng trắng)
        String data = dbData.trim();

        // 1. So sánh khớp chuẩn
        for (TrangThaiHoaDon status : TrangThaiHoaDon.values()) {
            if (status.getValue().equalsIgnoreCase(data)) return status;
        }

        // 2. "Cứu nét" nếu DB bị lỗi font thành Ch?a hoặc ?ã
        if (
            data.contains("Ch?") || data.startsWith("Ch")
        ) return TrangThaiHoaDon.CHUA_THANH_TOAN;
        if (
            data.contains("?ã") ||
            data.startsWith("Đ") ||
            data.contains("thanh toán")
        ) return TrangThaiHoaDon.DA_THANH_TOAN;
        if (
            data.contains("h?y") || data.contains("hủy")
        ) return TrangThaiHoaDon.DA_HUY;

        return TrangThaiHoaDon.CHUA_THANH_TOAN; // Mặc định nếu nát quá
    }
}
