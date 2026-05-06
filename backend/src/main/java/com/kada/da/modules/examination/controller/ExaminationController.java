package com.kada.da.Controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.Dto.HoSoKhamRequestDTO;

import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/examinations")
@RequiredArgsConstructor
public class ExaminationController {

    private final EntityManager em;

    @PostMapping("/save")
    @Transactional // BẮT BUỘC vì SP này có INSERT dữ liệu
    @PreAuthorize("hasRole('BAC_SI') or hasRole('ADMIN')")
    public ResponseEntity<?> saveExamination(@RequestBody HoSoKhamRequestDTO req) {
        StoredProcedureQuery sp = em.createStoredProcedureQuery("SP_LUU_HOSO_KHAM_BENH");

        // Đăng ký tham số khớp 100% với Oracle
        sp.registerStoredProcedureParameter("p_mahoso", String.class, ParameterMode.INOUT);
        sp.registerStoredProcedureParameter("p_makh", String.class, ParameterMode.IN);
        sp.registerStoredProcedureParameter("p_mans", String.class, ParameterMode.IN);
        sp.registerStoredProcedureParameter("p_ketluan", String.class, ParameterMode.IN);
        sp.registerStoredProcedureParameter("p_mat_trai_sph", Double.class, ParameterMode.IN);
        sp.registerStoredProcedureParameter("p_mat_trai_cyl", Double.class, ParameterMode.IN);
        sp.registerStoredProcedureParameter("p_mat_trai_ax", Integer.class, ParameterMode.IN);
        sp.registerStoredProcedureParameter("p_docong_trai", Double.class, ParameterMode.IN);
        sp.registerStoredProcedureParameter("p_mat_phai_sph", Double.class, ParameterMode.IN);
        sp.registerStoredProcedureParameter("p_mat_phai_cyl", Double.class, ParameterMode.IN);
        sp.registerStoredProcedureParameter("p_mat_phai_ax", Integer.class, ParameterMode.IN);
        sp.registerStoredProcedureParameter("p_docong_phai", Double.class, ParameterMode.IN);
        sp.registerStoredProcedureParameter("p_pd", Double.class, ParameterMode.IN);
        sp.registerStoredProcedureParameter("p_madon_out", String.class, ParameterMode.OUT);

        // Gán giá trị (ép kiểu về Double để tương thích với NUMBER trong SP)
        sp.setParameter("p_mahoso", null); // Trigger sẽ tự sinh mã HS
        sp.setParameter("p_makh", req.getMakh());
        sp.setParameter("p_mans", req.getMans());
        sp.setParameter("p_ketluan", req.getKetluan());
        sp.setParameter("p_mat_trai_sph", req.getMatTraiSph().doubleValue());
        sp.setParameter("p_mat_trai_cyl", req.getMatTraiCyl().doubleValue());
        sp.setParameter("p_mat_trai_ax", req.getMatTraiAx());
        sp.setParameter("p_docong_trai", req.getDoCongTrai() != null ? req.getDoCongTrai().doubleValue() : null);
        sp.setParameter("p_mat_phai_sph", req.getMatPhaiSph().doubleValue());
        sp.setParameter("p_mat_phai_cyl", req.getMatPhaiCyl().doubleValue());
        sp.setParameter("p_mat_phai_ax", req.getMatPhaiAx());
        sp.setParameter("p_docong_phai", req.getDoCongPhai() != null ? req.getDoCongPhai().doubleValue() : null);
        sp.setParameter("p_pd", req.getPd().doubleValue());

        // Thực thi
        sp.execute();

        // Lấy giá trị trả về từ tham số OUT
        String maHoSoMoi = (String) sp.getOutputParameterValue("p_mahoso");
        String maDonThuocMoi = (String) sp.getOutputParameterValue("p_madon_out");

        Map<String, String> response = new HashMap<>();
        response.put("message", "Lưu hồ sơ và tạo đơn thuốc thành công!");
        response.put("maHoSo", maHoSoMoi);
        response.put("maDonThuoc", maDonThuocMoi);

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // API LẤY LỊCH SỬ KHÁM BỆNH CỦA 1 KHÁCH HÀNG
    // =========================================================
    @GetMapping("/khach-hang/{maKh}")
    public ResponseEntity<?> getLichSuKham(@PathVariable("maKh") String maKh) {
        try {
            // Dùng JPQL truy vấn thẳng vào Entity HoSoThiLuc
            // Sắp xếp theo mã hồ sơ (hoặc ngày khám) giảm dần (mới nhất lên đầu)
            String jpql = "SELECT h FROM HoSoThiLuc h WHERE h.khachHang.maKh = :maKh ORDER BY h.maHoSo DESC";

            var lichSu = em.createQuery(jpql)
                    .setParameter("maKh", maKh)
                    .getResultList();

            if (lichSu.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "message", "Khách hàng này chưa có lịch sử khám.",
                        "data", lichSu));
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Lấy lịch sử khám thành công!",
                    "data", lichSu));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi lấy lịch sử khám: " + e.getMessage());
        }
    }
}