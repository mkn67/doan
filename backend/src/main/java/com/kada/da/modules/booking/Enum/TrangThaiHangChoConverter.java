package com.kada.da.modules.booking.Enum;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class TrangThaiHangChoConverter implements AttributeConverter<TrangThaiHangCho, String> {

    @Override
    public String convertToDatabaseColumn(TrangThaiHangCho attribute) {
        return (attribute == null) ? null : attribute.getValue();
    }

    @Override
    public TrangThaiHangCho convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        
        String normalized = dbData.trim();
        
        return switch (normalized) {
            case "Đang chờ", "Dang cho", "Đang chờ...", "??ang ch??", "Đang ch?", "Đang cho..." -> TrangThaiHangCho.DANG_CHO;
            case "Đang khám", "Dang kham", "??ang kh??m", "Đang kh?", "Dang kham..." -> TrangThaiHangCho.DANG_KHAM;
            case "Hoàn thành", "Hoan thanh", "Đã khám", "Da kham", "?? ho??n th??nh", "Hoàn thành..." -> TrangThaiHangCho.HOAN_THANH;
            case "Bỏ qua", "Bo qua", "Bỏ về", "Bo ve", "??ang b?? qua", "B? qua", "Bỏ về...", "B? v?" -> TrangThaiHangCho.BO_VE;
            default -> {
                String lower = normalized.toLowerCase();
                if (lower.contains("chờ") || lower.contains("cho")) {
                    yield TrangThaiHangCho.DANG_CHO;
                }
                if (lower.contains("khám") || lower.contains("kham")) {
                    yield TrangThaiHangCho.DANG_KHAM;
                }
                if (lower.contains("hoàn") || lower.contains("hoan") || lower.contains("thành") || lower.contains("thanh")) {
                    yield TrangThaiHangCho.HOAN_THANH;
                }
                if (lower.contains("qua") || lower.contains("về") || lower.contains("ve")) {
                    yield TrangThaiHangCho.BO_VE;
                }
                throw new IllegalArgumentException("Giá trị Hàng Chờ DB lạ: " + dbData);
            }
        };
    }
}
