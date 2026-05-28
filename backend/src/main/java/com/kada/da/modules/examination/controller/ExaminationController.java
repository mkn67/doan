package com.kada.da.modules.examination.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.modules.examination.dto.HoSoKhamRequestDTO;

import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/examinations")
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

        // Gán giá trị (ép kiểu về Double để tương thích với NUMBER trong SP, thêm null check để tránh NullPointerException)
        sp.setParameter("p_mahoso", null); // Trigger sẽ tự sinh mã HS
        sp.setParameter("p_makh", req.getMakh());
        sp.setParameter("p_mans", req.getMans());
        sp.setParameter("p_ketluan", req.getKetluan() != null ? req.getKetluan() : "Bình thường");
        sp.setParameter("p_mat_trai_sph", req.getMatTraiSph() != null ? req.getMatTraiSph().doubleValue() : 0.0);
        sp.setParameter("p_mat_trai_cyl", req.getMatTraiCyl() != null ? req.getMatTraiCyl().doubleValue() : 0.0);
        sp.setParameter("p_mat_trai_ax", req.getMatTraiAx() != null ? req.getMatTraiAx() : 0);
        sp.setParameter("p_docong_trai", req.getDoCongTrai() != null ? req.getDoCongTrai().doubleValue() : null);
        sp.setParameter("p_mat_phai_sph", req.getMatPhaiSph() != null ? req.getMatPhaiSph().doubleValue() : 0.0);
        sp.setParameter("p_mat_phai_cyl", req.getMatPhaiCyl() != null ? req.getMatPhaiCyl().doubleValue() : 0.0);
        sp.setParameter("p_mat_phai_ax", req.getMatPhaiAx() != null ? req.getMatPhaiAx() : 0);
        sp.setParameter("p_docong_phai", req.getDoCongPhai() != null ? req.getDoCongPhai().doubleValue() : null);
        sp.setParameter("p_pd", req.getPd() != null ? req.getPd().doubleValue() : 60.0);

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
            String jpql = "SELECT h FROM HoSoThiLuc h WHERE h.khachHang.maKh = :maKh ORDER BY h.maHoSo DESC";
            List<com.kada.da.modules.examination.domain.HoSoThiLuc> lichSu = em.createQuery(jpql, com.kada.da.modules.examination.domain.HoSoThiLuc.class)
                    .setParameter("maKh", maKh)
                    .getResultList();

            if (lichSu.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "message", "Khách hàng này chưa có lịch sử khám.",
                        "data", new java.util.ArrayList<>()));
            }

            List<com.kada.da.modules.examination.dto.HoSoKhamResponseDTO> dtoList = new java.util.ArrayList<>();
            for (com.kada.da.modules.examination.domain.HoSoThiLuc hoSo : lichSu) {
                String jpqlDetails = "SELECT c FROM ChiTietThiLuc c WHERE c.hoSoThiLuc.maHoSo = :maHoSo";
                List<com.kada.da.modules.examination.domain.ChiTietThiLuc> chiTiets = em.createQuery(jpqlDetails, com.kada.da.modules.examination.domain.ChiTietThiLuc.class)
                        .setParameter("maHoSo", hoSo.getMaHoSo())
                        .getResultList();

                List<com.kada.da.modules.examination.dto.ChiTietThiLucDTO> listDto = new java.util.ArrayList<>();
                for (com.kada.da.modules.examination.domain.ChiTietThiLuc ct : chiTiets) {
                    listDto.add(com.kada.da.modules.examination.dto.ChiTietThiLucDTO.builder()
                            .loaiMat(ct.getMat())
                            .sph(ct.getCau())
                            .cyl(ct.getTru())
                            .axis(ct.getTruc())
                            .va(ct.getThiLuc() != null ? ct.getThiLuc() : "10/10")
                            .pd(ct.getPd())
                            .add(ct.getAdd())
                            .build());
                }

                String jpqlPrescription = "SELECT p.maDon FROM PhieuKeDon p WHERE p.hoSoThiLuc.maHoSo = :maHoSo";
                List<String> prescriptions = em.createQuery(jpqlPrescription, String.class)
                        .setParameter("maHoSo", hoSo.getMaHoSo())
                        .getResultList();
                String maDonThuoc = prescriptions.isEmpty() ? null : prescriptions.get(0);

                dtoList.add(com.kada.da.modules.examination.dto.HoSoKhamResponseDTO.builder()
                        .maHoSo(hoSo.getMaHoSo())
                        .maKh(hoSo.getKhachHang() != null ? hoSo.getKhachHang().getMaKh() : null)
                        .tenKhachHang(hoSo.getKhachHang() != null ? hoSo.getKhachHang().getHoTen() : null)
                        .tenBacSi(hoSo.getNhanSu() != null ? hoSo.getNhanSu().getHoTen() : null)
                        .ngayKham(hoSo.getNgayKham() != null ? hoSo.getNgayKham().atStartOfDay() : null)
                        .ketLuan(hoSo.getKetLuan())
                        .danhSachThiLuc(listDto)
                        .maDonThuoc(maDonThuoc)
                        .build());
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Lấy lịch sử khám thành công!",
                    "data", dtoList));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi lấy lịch sử khám: " + e.getMessage());
        }
    }

    @GetMapping("/{maHoSo}")
    public ResponseEntity<?> getExamination(@PathVariable("maHoSo") String maHoSo) {
        try {
            com.kada.da.modules.examination.domain.HoSoThiLuc hoSo = em.find(com.kada.da.modules.examination.domain.HoSoThiLuc.class, maHoSo);
            if (hoSo == null) {
                return ResponseEntity.notFound().build();
            }

            String jpql = "SELECT c FROM ChiTietThiLuc c WHERE c.hoSoThiLuc.maHoSo = :maHoSo";
            List<com.kada.da.modules.examination.domain.ChiTietThiLuc> chiTiets = em.createQuery(jpql, com.kada.da.modules.examination.domain.ChiTietThiLuc.class)
                    .setParameter("maHoSo", maHoSo)
                    .getResultList();

            List<com.kada.da.modules.examination.dto.ChiTietThiLucDTO> listDto = new java.util.ArrayList<>();
            for (com.kada.da.modules.examination.domain.ChiTietThiLuc ct : chiTiets) {
                listDto.add(com.kada.da.modules.examination.dto.ChiTietThiLucDTO.builder()
                        .loaiMat(ct.getMat())
                        .sph(ct.getCau())
                        .cyl(ct.getTru())
                        .axis(ct.getTruc())
                        .va(ct.getThiLuc() != null ? ct.getThiLuc() : "10/10")
                        .pd(ct.getPd())
                        .add(ct.getAdd())
                        .build());
            }

            String jpqlPrescription = "SELECT p.maDon FROM PhieuKeDon p WHERE p.hoSoThiLuc.maHoSo = :maHoSo";
            List<String> prescriptions = em.createQuery(jpqlPrescription, String.class)
                    .setParameter("maHoSo", maHoSo)
                    .getResultList();
            String maDonThuoc = prescriptions.isEmpty() ? null : prescriptions.get(0);

            com.kada.da.modules.examination.dto.HoSoKhamResponseDTO response = com.kada.da.modules.examination.dto.HoSoKhamResponseDTO.builder()
                    .maHoSo(hoSo.getMaHoSo())
                    .maKh(hoSo.getKhachHang() != null ? hoSo.getKhachHang().getMaKh() : null)
                    .tenKhachHang(hoSo.getKhachHang() != null ? hoSo.getKhachHang().getHoTen() : null)
                    .tenBacSi(hoSo.getNhanSu() != null ? hoSo.getNhanSu().getHoTen() : null)
                    .ngayKham(hoSo.getNgayKham() != null ? hoSo.getNgayKham().atStartOfDay() : null)
                    .ketLuan(hoSo.getKetLuan())
                    .danhSachThiLuc(listDto)
                    .maDonThuoc(maDonThuoc)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi lấy hồ sơ khám: " + e.getMessage());
        }
    }
}
