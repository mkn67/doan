package com.kada.da.modules.booking.Enum;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class TrangThaiLichHenConverter implements AttributeConverter<TrangThaiLichHen, String> {

    @Override
    public String convertToDatabaseColumn(TrangThaiLichHen attribute) {
        return (attribute == null) ? null : attribute.getLabel();
    }

    @Override
    public TrangThaiLichHen convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        
        // Map cứng giá trị từ DB sang Enum constant
        return switch (dbData) {
            case "Chờ xác nhận" -> TrangThaiLichHen.CHO_XAC_NHAN;
            case "Đã xác nhận" -> TrangThaiLichHen.DA_XAC_NHAN;
            case "Đã check-in" -> TrangThaiLichHen.DA_CHECK_IN;
            case "Hoàn thành" -> TrangThaiLichHen.HOAN_THANH; // Lưu ý: khớp chữ "Hoàn thành"
            case "Đã hủy" -> TrangThaiLichHen.DA_HUY;
            default -> throw new IllegalArgumentException("Giá trị DB lạ: " + dbData);
        };
    }
}