package com.kada.da.modules.examination.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.modules.examination.dto.HoSoKhamRequestDTO;
import com.kada.da.modules.examination.service.ClinicService;

import org.springframework.jdbc.core.JdbcTemplate;
import lombok.extern.slf4j.Slf4j;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Slf4j
@RestController
@RequestMapping("/api/v1/examinations")
@RequiredArgsConstructor
public class ExaminationController {

    private final EntityManager em;
    private final JdbcTemplate jdbcTemplate;
    private final ClinicService clinicService;

    @PostMapping("/save")
    @Transactional // BẮT BUỘC vì nghiệp vụ này có INSERT/UPDATE dữ liệu
    @PreAuthorize("hasRole('BAC_SI') or hasRole('ADMIN')")
    public ResponseEntity<?> saveExamination(@RequestBody HoSoKhamRequestDTO req) {
        try {
            Map<String, Object> result = clinicService.saveExamination(req);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi khi lưu kết quả khám: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{maHoSo}")
    @Transactional
    @PreAuthorize("hasRole('BAC_SI') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteExamination(@PathVariable("maHoSo") String maHoSo,
                                               org.springframework.security.core.Authentication auth) {
        try {
            String username = auth != null ? auth.getName() : "system";
            clinicService.deleteExamination(maHoSo, username);
            return ResponseEntity.ok(Map.of("message", "Xóa hồ sơ khám bệnh thành công!"));
        } catch (Exception e) {
            log.error("Lỗi khi xóa hồ sơ khám bệnh: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
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

                // Lấy thông tin đơn kính từ xưởng
                String donKinh = null;
                if (maDonThuoc != null) {
                    List<String> list = jdbcTemplate.query(
                        "SELECT GHI_CHU FROM XU_LY_KINH WHERE MADON = ?",
                        (rs, rowNum) -> rs.getString("GHI_CHU"),
                        maDonThuoc
                    );
                    if (!list.isEmpty()) {
                        donKinh = list.get(0);
                    }
                }

                // Lấy danh sách thuốc nhỏ mắt
                List<String> donThuocList = new java.util.ArrayList<>();
                if (maDonThuoc != null) {
                    donThuocList = jdbcTemplate.query(
                        "SELECT sp.TENSP, ct.SOLUONG, ct.LIEUDUNG, ct.CACHDUNG " +
                        "FROM CT_KE_DON ct JOIN SAN_PHAM sp ON ct.MASP = sp.MASP " +
                        "WHERE ct.MADON = ?",
                        (rs, rowNum) -> rs.getString("TENSP") + " (SL: " + rs.getInt("SOLUONG") + ") - Hướng dẫn: " + rs.getString("LIEUDUNG") + " " + rs.getString("CACHDUNG"),
                        maDonThuoc
                    );
                }

                dtoList.add(com.kada.da.modules.examination.dto.HoSoKhamResponseDTO.builder()
                        .maHoSo(hoSo.getMaHoSo())
                        .maKh(hoSo.getKhachHang() != null ? hoSo.getKhachHang().getMaKh() : null)
                        .maNs(hoSo.getNhanSu() != null ? hoSo.getNhanSu().getMaNs() : null)
                        .tenKhachHang(hoSo.getKhachHang() != null ? hoSo.getKhachHang().getHoTen() : null)
                        .tenBacSi(hoSo.getNhanSu() != null ? hoSo.getNhanSu().getHoTen() : null)
                        .ngayKham(hoSo.getNgayKham() != null ? hoSo.getNgayKham().atStartOfDay() : null)
                        .ketLuan(hoSo.getKetLuan())
                        .danhSachThiLuc(listDto)
                        .maDonThuoc(maDonThuoc)
                        .donKinh(donKinh)
                        .donThuocList(donThuocList)
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

            // Lấy thông tin đơn kính từ xưởng
            String donKinh = null;
            if (maDonThuoc != null) {
                List<String> list = jdbcTemplate.query(
                    "SELECT GHI_CHU FROM XU_LY_KINH WHERE MADON = ?",
                    (rs, rowNum) -> rs.getString("GHI_CHU"),
                    maDonThuoc
                );
                if (!list.isEmpty()) {
                    donKinh = list.get(0);
                }
            }

            // Lấy danh sách thuốc nhỏ mắt
            List<String> donThuocList = new java.util.ArrayList<>();
            if (maDonThuoc != null) {
                donThuocList = jdbcTemplate.query(
                    "SELECT sp.TENSP, ct.SOLUONG, ct.LIEUDUNG, ct.CACHDUNG " +
                    "FROM CT_KE_DON ct JOIN SAN_PHAM sp ON ct.MASP = sp.MASP " +
                    "WHERE ct.MADON = ?",
                    (rs, rowNum) -> rs.getString("TENSP") + " (SL: " + rs.getInt("SOLUONG") + ") - Hướng dẫn: " + rs.getString("LIEUDUNG") + " " + rs.getString("CACHDUNG"),
                    maDonThuoc
                );
            }

            com.kada.da.modules.examination.dto.HoSoKhamResponseDTO response = com.kada.da.modules.examination.dto.HoSoKhamResponseDTO.builder()
                    .maHoSo(hoSo.getMaHoSo())
                    .maKh(hoSo.getKhachHang() != null ? hoSo.getKhachHang().getMaKh() : null)
                    .maNs(hoSo.getNhanSu() != null ? hoSo.getNhanSu().getMaNs() : null)
                    .tenKhachHang(hoSo.getKhachHang() != null ? hoSo.getKhachHang().getHoTen() : null)
                    .tenBacSi(hoSo.getNhanSu() != null ? hoSo.getNhanSu().getHoTen() : null)
                    .ngayKham(hoSo.getNgayKham() != null ? hoSo.getNgayKham().atStartOfDay() : null)
                    .ketLuan(hoSo.getKetLuan())
                    .danhSachThiLuc(listDto)
                    .maDonThuoc(maDonThuoc)
                    .donKinh(donKinh)
                    .donThuocList(donThuocList)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi lấy hồ sơ khám: " + e.getMessage());
        }
    }
}
