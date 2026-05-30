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
        
        String normalized = dbData.trim();
        
        return switch (normalized) {
            case "Chờ xác nhận", "Cho xac nhan", "Mới", "Moi", "M??i" -> TrangThaiLichHen.CHO_XAC_NHAN;
            case "Đã xác nhận", "Da xac nhan", "?? x??c nh??n", "?? xác nhận" -> TrangThaiLichHen.DA_XAC_NHAN;
            case "Đã check-in", "Da check-in", "?? check-in" -> TrangThaiLichHen.DA_CHECK_IN;
            case "Hoàn thành", "Hoan thanh", "Đã khám", "Da kham", "?? kh??m", "?? khám" -> TrangThaiLichHen.HOAN_THANH;
            case "Đã hủy", "Da huy", "?? hu`y", "?? hủy" -> TrangThaiLichHen.DA_HUY;
            default -> {
                if (normalized.toLowerCase().contains("khám") || normalized.toLowerCase().contains("kham")) {
                    yield TrangThaiLichHen.HOAN_THANH;
                }
                if (normalized.toLowerCase().contains("mới") || normalized.toLowerCase().contains("moi")) {
                    yield TrangThaiLichHen.CHO_XAC_NHAN;
                }
                throw new IllegalArgumentException("Giá trị DB lạ: " + dbData);
            }
        };
    }
}