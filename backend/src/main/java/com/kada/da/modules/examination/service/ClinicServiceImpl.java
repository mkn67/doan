package com.kada.da.modules.examination.service;

import java.sql.Types;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kada.da.Exception.BusinessRuleException;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.modules.examination.dto.HoSoKhamRequestDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClinicServiceImpl implements ClinicService {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public Map<String, Object> saveExamination(HoSoKhamRequestDTO req) {
        // 1. Xác thực nghiêm ngặt dữ liệu đầu vào
        validateInput(req);

        String makh = req.getMakh();
        String mans = req.getMans();
        String ketluan = req.getKetluan() != null ? req.getKetluan() : "Bình thường";
        String maHoSo = req.getMaHoSo();

        // 2. Tự động kiểm tra khám lần đầu (firstExamination) hay tái khám (reExamination)
        String queryCount = "SELECT COUNT(*) FROM HO_SO_THI_LUC WHERE MAKH = ?";
        Integer recordCount = jdbcTemplate.queryForObject(queryCount, Integer.class, makh);
        boolean isFirstExam = (recordCount == null || recordCount == 0);
        String examType = isFirstExam ? "firstExamination" : "reExamination";

        String maHoSoResult;
        String maDonThuocResult;

        if (maHoSo == null || maHoSo.trim().isEmpty()) {
            // TẠO MỚI HỒ SƠ
            // Gọi stored procedure SP_LUU_HOSO_KHAM_BENH
            Map<String, Object> spResult = jdbcTemplate.execute(
                "{call SP_LUU_HOSO_KHAM_BENH(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}",
                (java.sql.CallableStatement cs) -> {
                    cs.registerOutParameter(1, Types.VARCHAR); // p_mahoso (IN OUT)
                    cs.setString(1, null);
                    cs.setString(2, makh);
                    cs.setString(3, mans);
                    cs.setNString(4, ketluan);
                    cs.setDouble(5, req.getMatTraiSph() != null ? req.getMatTraiSph().doubleValue() : 0.0);
                    cs.setDouble(6, req.getMatTraiCyl() != null ? req.getMatTraiCyl().doubleValue() : 0.0);
                    cs.setInt(7, req.getMatTraiAx() != null ? req.getMatTraiAx() : 0);
                    if (req.getDoCongTrai() != null) {
                        cs.setDouble(8, req.getDoCongTrai().doubleValue());
                    } else {
                        cs.setNull(8, Types.DOUBLE);
                    }
                    cs.setDouble(9, req.getMatPhaiSph() != null ? req.getMatPhaiSph().doubleValue() : 0.0);
                    cs.setDouble(10, req.getMatPhaiCyl() != null ? req.getMatPhaiCyl().doubleValue() : 0.0);
                    cs.setInt(11, req.getMatPhaiAx() != null ? req.getMatPhaiAx() : 0);
                    if (req.getDoCongPhai() != null) {
                        cs.setDouble(12, req.getDoCongPhai().doubleValue());
                    } else {
                        cs.setNull(12, Types.DOUBLE);
                    }
                    cs.setDouble(13, req.getPd() != null ? req.getPd().doubleValue() : 60.0);
                    cs.registerOutParameter(14, Types.VARCHAR); // p_madon_out

                    cs.execute();

                    Map<String, Object> out = new HashMap<>();
                    out.put("maHoSo", cs.getString(1));
                    out.put("maDonThuoc", cs.getString(14));
                    return out;
                }
            );

            maHoSoResult = (String) spResult.get("maHoSo");
            maDonThuocResult = (String) spResult.get("maDonThuoc");

            // Nhật ký bảo mật tạo mới
            log.info("[AUDIT] TẠO MỚI HỒ SƠ ({}) - Mã HS: {}, Bệnh nhân: {}, Bác sĩ: {}, SPH_T: {}, CYL_T: {}, AX_T: {}, SPH_P: {}, CYL_P: {}, AX_P: {}, PD: {}, KL: {}",
                    examType, maHoSoResult, makh, mans,
                    req.getMatTraiSph(), req.getMatTraiCyl(), req.getMatTraiAx(),
                    req.getMatPhaiSph(), req.getMatPhaiCyl(), req.getMatPhaiAx(),
                    req.getPd(), ketluan);

            // Ghi vào bảng lịch sử AUDIT_HOSO_THILUC (Khởi tạo)
            try {
                Integer auditSeq = jdbcTemplate.queryForObject("SELECT SEQ_AUDIT.NEXTVAL FROM dual", Integer.class);
                String maAudit = String.format("AUD%09d", auditSeq);
                
                StringBuilder initDiff = new StringBuilder();
                initDiff.append("Khởi tạo: Trai_SPH=").append(req.getMatTraiSph() != null ? req.getMatTraiSph() : 0.0)
                        .append(", Phai_SPH=").append(req.getMatPhaiSph() != null ? req.getMatPhaiSph() : 0.0)
                        .append(", KL=\"").append(ketluan).append("\"");

                jdbcTemplate.update(
                        "INSERT INTO AUDIT_HOSO_THILUC(MAAUDIT, MAHOSO, OLD_KETLUAN, NEW_KETLUAN, THOI_GIAN, NGUOI_THUC_HIEN) VALUES (?, ?, ?, ?, SYSTIMESTAMP, ?)",
                        maAudit, maHoSoResult, "Hồ sơ mới", initDiff.toString(), mans
                );
            } catch (Exception e) {
                log.error("Lỗi khi lưu audit log khởi tạo: ", e);
            }

        } else {
            // CẬP NHẬT HỒ SƠ
            maHoSoResult = maHoSo;
            maDonThuocResult = "KD_" + maHoSo;

            // 1. Kiểm tra tồn tại
            String checkExists = "SELECT COUNT(*) FROM HO_SO_THI_LUC WHERE MAHOSO = ?";
            Integer exists = jdbcTemplate.queryForObject(checkExists, Integer.class, maHoSo);
            if (exists == null || exists == 0) {
                throw new ResourceNotFoundException("Không tìm thấy hồ sơ thị lực để cập nhật: " + maHoSo);
            }

            // 2. Lấy dữ liệu cũ để phục vụ thuật toán so sánh phiên bản (Version Diffing)
            Map<String, Object> oldHoSo = jdbcTemplate.queryForMap(
                    "SELECT KETLUAN, MANS FROM HO_SO_THI_LUC WHERE MAHOSO = ?", maHoSo);
            
            List<Map<String, Object>> oldChiTiets = jdbcTemplate.queryForList(
                    "SELECT MAT, DOCAU_SPH, DOTRU_CYL, TRUC_AX, KHOANGCACH_PD, DOCONG_ADD FROM CHI_TIET_THI_LUC WHERE MAHOSO = ?", maHoSo);
            
            // Lấy donKinh cũ (từ XU_LY_KINH)
            List<String> oldDonKinhList = jdbcTemplate.query(
                    "SELECT GHI_CHU FROM XU_LY_KINH WHERE MADON = ?",
                    (rs, rowNum) -> rs.getString("GHI_CHU"),
                    maDonThuocResult
            );
            String oldDonKinh = oldDonKinhList.isEmpty() ? "" : oldDonKinhList.get(0);

            // Phân tách chi tiết cũ
            Map<String, Object> oldLeft = null;
            Map<String, Object> oldRight = null;
            for (Map<String, Object> ct : oldChiTiets) {
                if ("T".equals(ct.get("MAT"))) {
                    oldLeft = ct;
                } else if ("P".equals(ct.get("MAT"))) {
                    oldRight = ct;
                }
            }

            // Lấy các giá trị cũ an toàn
            double oldMatTraiSph = oldLeft != null && oldLeft.get("DOCAU_SPH") != null ? ((Number) oldLeft.get("DOCAU_SPH")).doubleValue() : 0.0;
            double oldMatTraiCyl = oldLeft != null && oldLeft.get("DOTRU_CYL") != null ? ((Number) oldLeft.get("DOTRU_CYL")).doubleValue() : 0.0;
            int oldMatTraiAx = oldLeft != null && oldLeft.get("TRUC_AX") != null ? ((Number) oldLeft.get("TRUC_AX")).intValue() : 0;
            double oldMatTraiAdd = oldLeft != null && oldLeft.get("DOCONG_ADD") != null ? ((Number) oldLeft.get("DOCONG_ADD")).doubleValue() : 0.0;

            double oldMatPhaiSph = oldRight != null && oldRight.get("DOCAU_SPH") != null ? ((Number) oldRight.get("DOCAU_SPH")).doubleValue() : 0.0;
            double oldMatPhaiCyl = oldRight != null && oldRight.get("DOTRU_CYL") != null ? ((Number) oldRight.get("DOTRU_CYL")).doubleValue() : 0.0;
            int oldMatPhaiAx = oldRight != null && oldRight.get("TRUC_AX") != null ? ((Number) oldRight.get("TRUC_AX")).intValue() : 0;
            double oldMatPhaiAdd = oldRight != null && oldRight.get("DOCONG_ADD") != null ? ((Number) oldRight.get("DOCONG_ADD")).doubleValue() : 0.0;

            double oldPd = oldLeft != null && oldLeft.get("KHOANGCACH_PD") != null ? ((Number) oldLeft.get("KHOANGCACH_PD")).doubleValue() : 60.0;
            String oldKetLuan = oldHoSo.get("KETLUAN") != null ? (String) oldHoSo.get("KETLUAN") : "";

            // New values
            double newMatTraiSph = req.getMatTraiSph() != null ? req.getMatTraiSph().doubleValue() : 0.0;
            double newMatTraiCyl = req.getMatTraiCyl() != null ? req.getMatTraiCyl().doubleValue() : 0.0;
            int newMatTraiAx = req.getMatTraiAx() != null ? req.getMatTraiAx() : 0;
            double newMatTraiAdd = req.getDoCongTrai() != null ? req.getDoCongTrai().doubleValue() : 0.0;

            double newMatPhaiSph = req.getMatPhaiSph() != null ? req.getMatPhaiSph().doubleValue() : 0.0;
            double newMatPhaiCyl = req.getMatPhaiCyl() != null ? req.getMatPhaiCyl().doubleValue() : 0.0;
            int newMatPhaiAx = req.getMatPhaiAx() != null ? req.getMatPhaiAx() : 0;
            double newMatPhaiAdd = req.getDoCongPhai() != null ? req.getDoCongPhai().doubleValue() : 0.0;

            double newPd = req.getPd() != null ? req.getPd().doubleValue() : 60.0;
            String newKetLuan = ketluan;
            String newDonKinh = req.getDonKinh() != null ? req.getDonKinh() : "";

            // So sánh các trường dữ liệu
            boolean changed = (oldMatTraiSph != newMatTraiSph)
                    || (oldMatTraiCyl != newMatTraiCyl)
                    || (oldMatTraiAx != newMatTraiAx)
                    || (oldMatTraiAdd != newMatTraiAdd)
                    || (oldMatPhaiSph != newMatPhaiSph)
                    || (oldMatPhaiCyl != newMatPhaiCyl)
                    || (oldMatPhaiAx != newMatPhaiAx)
                    || (oldMatPhaiAdd != newMatPhaiAdd)
                    || (oldPd != newPd)
                    || (!oldKetLuan.equals(newKetLuan))
                    || (!oldDonKinh.equals(newDonKinh));

            if (changed) {
                // Xây dựng chuỗi thông số thay đổi chi tiết
                StringBuilder oldDiff = new StringBuilder();
                StringBuilder newDiff = new StringBuilder();

                if (oldMatTraiSph != newMatTraiSph) {
                    oldDiff.append("OS_SPH=").append(oldMatTraiSph).append("; ");
                    newDiff.append("OS_SPH=").append(newMatTraiSph).append("; ");
                }
                if (oldMatTraiCyl != newMatTraiCyl) {
                    oldDiff.append("OS_CYL=").append(oldMatTraiCyl).append("; ");
                    newDiff.append("OS_CYL=").append(newMatTraiCyl).append("; ");
                }
                if (oldMatTraiAx != newMatTraiAx) {
                    oldDiff.append("OS_AX=").append(oldMatTraiAx).append("; ");
                    newDiff.append("OS_AX=").append(newMatTraiAx).append("; ");
                }
                if (oldMatPhaiSph != newMatPhaiSph) {
                    oldDiff.append("OD_SPH=").append(oldMatPhaiSph).append("; ");
                    newDiff.append("OD_SPH=").append(newMatPhaiSph).append("; ");
                }
                if (oldMatPhaiCyl != newMatPhaiCyl) {
                    oldDiff.append("OD_CYL=").append(oldMatPhaiCyl).append("; ");
                    newDiff.append("OD_CYL=").append(newMatPhaiCyl).append("; ");
                }
                if (oldMatPhaiAx != newMatPhaiAx) {
                    oldDiff.append("OD_AX=").append(oldMatPhaiAx).append("; ");
                    newDiff.append("OD_AX=").append(newMatPhaiAx).append("; ");
                }
                if (oldPd != newPd) {
                    oldDiff.append("PD=").append(oldPd).append("; ");
                    newDiff.append("PD=").append(newPd).append("; ");
                }
                if (!oldKetLuan.equals(newKetLuan)) {
                    oldDiff.append("KL=\"").append(oldKetLuan).append("\"; ");
                    newDiff.append("KL=\"").append(newKetLuan).append("\"; ");
                }
                if (!oldDonKinh.equals(newDonKinh)) {
                    oldDiff.append("DK=\"").append(oldDonKinh).append("\"; ");
                    newDiff.append("DK=\"").append(newDonKinh).append("\"; ");
                }

                // Ghi vào bảng lịch sử AUDIT_HOSO_THILUC
                Integer auditSeq = jdbcTemplate.queryForObject("SELECT SEQ_AUDIT.NEXTVAL FROM dual", Integer.class);
                String maAudit = String.format("AUD%09d", auditSeq);

                String oldValStr = oldDiff.length() > 255 ? oldDiff.substring(0, 252) + "..." : oldDiff.toString();
                String newValStr = newDiff.length() > 255 ? newDiff.substring(0, 252) + "..." : newDiff.toString();

                jdbcTemplate.update(
                        "INSERT INTO AUDIT_HOSO_THILUC(MAAUDIT, MAHOSO, OLD_KETLUAN, NEW_KETLUAN, THOI_GIAN, NGUOI_THUC_HIEN) VALUES (?, ?, ?, ?, SYSTIMESTAMP, ?)",
                        maAudit, maHoSo, oldValStr, newValStr, mans
                );

                // Nhật ký bảo mật cập nhật chi tiết
                log.info("[AUDIT] CẬP NHẬT HỒ SƠ - Mã HS: {}, Bác sĩ: {}. [Thay đổi chi tiết] -> Trước: {} | Sau: {}",
                        maHoSo, mans, oldValStr, newValStr);
            }

            // Thực hiện update dữ liệu cũ
            jdbcTemplate.update("UPDATE HO_SO_THI_LUC SET KETLUAN = ?, MANS = ? WHERE MAHOSO = ?", ketluan, mans, maHoSo);
            jdbcTemplate.update("UPDATE CHI_TIET_THI_LUC SET DOCAU_SPH = ?, DOTRU_CYL = ?, TRUC_AX = ?, KHOANGCACH_PD = ?, DOCONG_ADD = ? WHERE MAHOSO = ? AND MAT = ?",
                    newMatTraiSph, newMatTraiCyl, newMatTraiAx, newPd, req.getDoCongTrai() != null ? req.getDoCongTrai().doubleValue() : null, maHoSo, "T");
            jdbcTemplate.update("UPDATE CHI_TIET_THI_LUC SET DOCAU_SPH = ?, DOTRU_CYL = ?, TRUC_AX = ?, KHOANGCACH_PD = ?, DOCONG_ADD = ? WHERE MAHOSO = ? AND MAT = ?",
                    newMatPhaiSph, newMatPhaiCyl, newMatPhaiAx, newPd, req.getDoCongPhai() != null ? req.getDoCongPhai().doubleValue() : null, maHoSo, "P");
        }

        // 3. Liên kết tự động xuống xưởng mài lắp kính (Auto-linking)
        if (req.getDonKinh() != null && !req.getDonKinh().trim().isEmpty()) {
            handleAutoLinkingWorkshop(maDonThuocResult, req.getDonKinh());
        } else {
            // Nếu gửi đơn kính rỗng, xóa khỏi xưởng nếu có
            jdbcTemplate.update("DELETE FROM XU_LY_KINH WHERE MADON = ?", maDonThuocResult);
        }

        // 4. Tự động tạo hóa đơn tách biệt cho kính và thuốc (nếu có)
        if (maDonThuocResult != null) {
            createInvoicesForPrescription(maDonThuocResult, mans);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("maHoSo", maHoSoResult);
        response.put("maDonThuoc", maDonThuocResult);
        response.put("message", "Lưu hồ sơ và đồng bộ xưởng gia công thành công!");
        return response;
    }

    @Override
    @Transactional
    public void deleteExamination(String maHoSo, String username) {
        // 1. Kiểm tra sự tồn tại của hồ sơ
        String findHs = "SELECT COUNT(*) FROM HO_SO_THI_LUC WHERE MAHOSO = ?";
        Integer count = jdbcTemplate.queryForObject(findHs, Integer.class, maHoSo);
        if (count == null || count == 0) {
            throw new ResourceNotFoundException("Không tìm thấy hồ sơ để xóa: " + maHoSo);
        }

        String maDon = "KD_" + maHoSo;

        // Nhật ký hoạt động bảo mật xóa hồ sơ
        log.info("[AUDIT] XÓA HỒ SƠ BỆNH ÁN - Mã HS: {}, Người thực hiện: {}", maHoSo, username);

        // 2. Xóa các bảng liên kết an toàn
        jdbcTemplate.update("DELETE FROM XU_LY_KINH WHERE MADON = ?", maDon);
        jdbcTemplate.update("DELETE FROM CT_KE_DON WHERE MADON = ?", maDon);
        jdbcTemplate.update("DELETE FROM PHIEU_KE_DON WHERE MADON = ?", maDon);
        jdbcTemplate.update("DELETE FROM CHI_TIET_THI_LUC WHERE MAHOSO = ?", maHoSo);
        jdbcTemplate.update("DELETE FROM AUDIT_HOSO_THILUC WHERE MAHOSO = ?", maHoSo);
        jdbcTemplate.update("DELETE FROM DANH_GIA WHERE MAHOSO = ?", maHoSo);
        jdbcTemplate.update("DELETE FROM HO_SO_THI_LUC WHERE MAHOSO = ?", maHoSo);
    }

    private void validateInput(HoSoKhamRequestDTO req) {
        if (req.getMakh() == null || req.getMakh().trim().isEmpty()) {
            throw new BusinessRuleException("Mã khách hàng không được để trống!");
        }
        if (req.getMans() == null || req.getMans().trim().isEmpty()) {
            throw new BusinessRuleException("Mã nhân viên (bác sĩ) không được để trống!");
        }
        if (req.getKetluan() == null || req.getKetluan().trim().isEmpty()) {
            throw new BusinessRuleException("Kết luận chẩn đoán không được để trống!");
        }

        // Kiểm tra khoảng cách đồng tử PD
        if (req.getPd() == null || req.getPd().doubleValue() <= 0) {
            throw new BusinessRuleException("Khoảng cách đồng tử PD phải lớn hơn 0!");
        }

        // Kiểm tra trục Axis của mắt trái
        if (req.getMatTraiAx() != null && (req.getMatTraiAx() < 0 || req.getMatTraiAx() > 180)) {
            throw new BusinessRuleException("Trục loạn thị (Axis) của mắt trái phải nằm trong khoảng 0° - 180°!");
        }

        // Kiểm tra trục Axis của mắt phải
        if (req.getMatPhaiAx() != null && (req.getMatPhaiAx() < 0 || req.getMatPhaiAx() > 180)) {
            throw new BusinessRuleException("Trục loạn thị (Axis) của mắt phải phải nằm trong khoảng 0° - 180°!");
        }
    }

    private void handleAutoLinkingWorkshop(String maDon, String donKinhRaw) {
        // Tách gọng và tròng
        String gong = "";
        String trong = "";
        String[] parts = donKinhRaw.split(",", 2);
        if (parts.length >= 1) {
            gong = parts[0].trim();
        }
        if (parts.length >= 2) {
            trong = parts[1].trim();
        }

        // Tạo JSON string
        String jsonThongSo;
        try {
            Map<String, String> thongSoMap = new HashMap<>();
            thongSoMap.put("gong", gong);
            thongSoMap.put("trong", trong);
            jsonThongSo = objectMapper.writeValueAsString(thongSoMap);
        } catch (Exception e) {
            jsonThongSo = "{\"gong\":\"" + gong + "\",\"trong\":\"" + trong + "\"}";
        }

        // Kiểm tra xem đã có yêu cầu gia công cho MADON này chưa
        String queryCount = "SELECT COUNT(*) FROM XU_LY_KINH WHERE MADON = ?";
        Integer count = jdbcTemplate.queryForObject(queryCount, Integer.class, maDon);

        if (count != null && count > 0) {
            // Đã tồn tại -> Cập nhật thông tin đơn kính gia công
            jdbcTemplate.update("UPDATE XU_LY_KINH SET THONG_SO_KINH = ?, GHI_CHU = ? WHERE MADON = ?",
                    jsonThongSo, donKinhRaw, maDon);
            log.info("Cập nhật thành công yêu cầu gia công kính tại xưởng cho đơn thuốc: {}", maDon);
        } else {
            // Chưa tồn tại -> Tạo mới yêu cầu gia công kính
            // Sinh mã tự động dạng TS01, TS02,...
            Integer seqVal = jdbcTemplate.queryForObject("SELECT SEQ_XU_LY_KINH.NEXTVAL FROM dual", Integer.class);
            String maXl = String.format("TS%02d", seqVal);

            jdbcTemplate.update(
                    "INSERT INTO XU_LY_KINH (MAXL, MADON, THONG_SO_KINH, TRANG_THAI, NGAY_BAT_DAU, GHI_CHU) VALUES (?, ?, ?, ?, SYSTIMESTAMP, ?)",
                    maXl, maDon, jsonThongSo, "Chờ gia công", donKinhRaw
            );
            log.info("Tự động tạo mới yêu cầu gia công kính: {} cho đơn thuốc: {} với trạng thái Chờ gia công", maXl, maDon);
        }
    }

    private void createInvoicesForPrescription(String maDon, String maNsThuNgan) {
        // Lấy danh sách sản phẩm trong đơn thuốc (CT_KE_DON)
        String sql = "SELECT c.MASP, s.LATHUOC " +
                     "FROM CT_KE_DON c JOIN SAN_PHAM s ON c.MASP = s.MASP " +
                     "WHERE c.MADON = ?";
        List<Map<String, Object>> items = jdbcTemplate.queryForList(sql, maDon);
        if (items.isEmpty()) return;

        String maHoso = jdbcTemplate.queryForObject(
                "SELECT MAHOSO FROM PHIEU_KE_DON WHERE MADON = ?", String.class, maDon);
        String maKh = jdbcTemplate.queryForObject(
                "SELECT MAKH FROM HO_SO_THI_LUC WHERE MAHOSO = ?", String.class, maHoso);

        boolean hasGlass = items.stream().anyMatch(row -> Integer.valueOf(0).equals(row.get("LATHUOC")));
        boolean hasMedicine = items.stream().anyMatch(row -> Integer.valueOf(1).equals(row.get("LATHUOC")));

        try {
            // Lập 1 hóa đơn tổng hợp duy nhất gộp chung cả khám bệnh, thuốc và kính
            callSpTaoHoaDon(maKh, maNsThuNgan, maHoso, maDon, "CA_HAI");
        } catch (Exception e) {
            log.error("Lỗi tự động tạo hóa đơn từ đơn thuốc {}: {}", maDon, e.getMessage());
        }
    }

    private void callSpTaoHoaDon(String maKh, String maNs, String maHoso, String maDon, String loaiKeDon) {
        jdbcTemplate.execute(
            "{call SP_TAO_HOA_DON(?, ?, ?, ?, ?, ?, ?, ?)}",
            (java.sql.CallableStatement cs) -> {
                cs.setString(1, maKh);
                cs.setString(2, maNs);
                cs.setString(3, maHoso);
                cs.setString(4, maDon);
                cs.setString(5, null);
                cs.setString(6, null);
                cs.registerOutParameter(7, Types.VARCHAR); // p_mahd_out
                cs.setString(8, loaiKeDon);
                
                cs.execute();
                
                String maHd = cs.getString(7);
                log.info("[AUTO-BILLING] Đã tự động lập hóa đơn {} cho đơn thuốc {} (loại: {})", 
                        maHd, maDon, loaiKeDon);
                return maHd;
            }
        );
    }
}
