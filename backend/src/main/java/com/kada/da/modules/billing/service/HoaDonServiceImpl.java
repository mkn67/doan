package com.kada.da.modules.billing.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // 1. NHỚ IMPORT ENUM

import com.kada.da.Exception.BusinessRuleException;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.modules.billing.Enum.TrangThaiHoaDon;
import com.kada.da.modules.billing.domain.CtHoaDon;
import com.kada.da.modules.billing.domain.CtHoaDonDv;
import com.kada.da.modules.billing.domain.CtHoaDonId;
import com.kada.da.modules.billing.domain.HoaDon;
import com.kada.da.modules.billing.dto.HoaDonRequestDTO;
import com.kada.da.modules.billing.dto.HoaDonResponseDTO;
import com.kada.da.modules.billing.dto.PendingInvoiceResponseDTO;
import com.kada.da.modules.examination.domain.HoSoThiLuc;
import com.kada.da.modules.prescription.domain.PhieuKeDon;
import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import com.kada.da.modules.billing.repository.CtHoaDonRepository;
import com.kada.da.modules.billing.repository.HoaDonRepository;
import com.kada.da.modules.inventory.domain.LoHang;
import com.kada.da.modules.inventory.repository.LoHangRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HoaDonServiceImpl implements HoaDonService {

    private final HoaDonRepository hoaDonRepository;
    private final LoHangRepository loHangRepository;
    private final CtHoaDonRepository ctHoaDonRepository;
    private final EntityManager em;

    @Override
    @Transactional
    public HoaDon thanhToanHoaDon(HoaDon hoaDon) {
        // 1. Khởi tạo thông tin hóa đơn
        hoaDon.setMaHd("HD" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        hoaDon.setNgayLap(LocalDateTime.now());

        // 2. ĐÃ FIX: Dùng Enum thay cho String "Đã thanh toán"
        hoaDon.setTrangThai(TrangThaiHoaDon.DA_THANH_TOAN);

        if (hoaDon.getCtHoaDons() == null || hoaDon.getCtHoaDons().isEmpty()) {
            throw new BusinessRuleException("Hóa đơn phải có ít nhất một sản phẩm!");
        }

        BigDecimal tongTien = BigDecimal.ZERO;

        for (CtHoaDon ct : hoaDon.getCtHoaDons()) {
            LoHang loHang = loHangRepository.findById(ct.getLoHang().getMaLo())
                    .orElseThrow(() -> new BusinessRuleException("Lô hàng không tồn tại!"));

            if (loHang.getSoLuongTon() < ct.getSoLuong()) {
                throw new BusinessRuleException("Sản phẩm " + loHang.getSanPham().getTenSp()
                        + " trong lô " + loHang.getMaLo() + " không đủ số lượng tồn!");
            }

            // Trừ tồn kho
            loHang.setSoLuongTon(loHang.getSoLuongTon() - ct.getSoLuong());
            loHangRepository.save(loHang);

            ct.setHoaDon(hoaDon);
            ctHoaDonRepository.save(ct);

            BigDecimal lineTotal = ct.getDonGia().multiply(BigDecimal.valueOf(ct.getSoLuong()));

            tongTien = tongTien.add(lineTotal);
        }

        hoaDon.setTongTien(tongTien);

        return hoaDonRepository.save(hoaDon);
    }

    @Override
    @Transactional(readOnly = true)
    public HoaDon findById(String maHd) {
        return hoaDonRepository.findById(maHd)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn mã: " + maHd));
    }

    @Override
    @Transactional
    public Map<String, String> taoHoaDonTuJson(String maKh, String maNs, String maHoso, String maDon, String jsonSp,
            String jsonDv, String loaiKeDon) {
        log.info("Gọi SP_TAO_HOA_DON: khách={}, nhân viên={}, đơn={}, loại={}", maKh, maNs, maDon, loaiKeDon);
        Map<String, String> result = hoaDonRepository.taoHoaDonTuJson(maKh, maNs, maHoso, maDon, jsonSp, jsonDv, loaiKeDon);
        log.info("Tạo hóa đơn thành công, mã: {}", result.get("maHd"));
        return result;
    }

    @Override
    @Transactional
    public void huyHoaDon(String maHd) {
        log.info("Huy hoa don: {}", maHd);
        hoaDonRepository.huyHoaDon(maHd);
        log.info("Hủy hóa đơn thành công: {}", maHd);
    }

    @Override
    @Transactional
    public HoaDonResponseDTO taoHoaDon(HoaDonRequestDTO request) {
        HoaDon hoaDon = new HoaDon();
        hoaDon.setMaHd("HD" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        hoaDon.setNgayLap(LocalDateTime.now());
        hoaDon.setTrangThai(TrangThaiHoaDon.CHUA_THANH_TOAN);
        hoaDon = hoaDonRepository.save(hoaDon);

        BigDecimal tongTienHienTai = BigDecimal.ZERO;

        for (var item : request.getDsSanPhams()) {
            int soLuongCanMua = item.getSoLuong();

            List<LoHang> danhSachLo = loHangRepository.getDanhSachLoFefo(item.getMaLo());

            for (LoHang lo : danhSachLo) {
                if (soLuongCanMua <= 0) {
                    break;
                }

                int layTuLoNay = Math.min(soLuongCanMua, lo.getSoLuongTon());

                CtHoaDon ct = new CtHoaDon();
                ct.setId(new CtHoaDonId(hoaDon.getMaHd(), lo.getMaLo()));
                ct.setLoHang(lo);
                ct.setSoLuong(layTuLoNay);
                ct.setDonGia(item.getDonGia());
                ct.setHoaDon(hoaDon);

                ctHoaDonRepository.save(ct);

                lo.setSoLuongTon(lo.getSoLuongTon() - layTuLoNay);
                loHangRepository.save(lo);

                soLuongCanMua -= layTuLoNay;
                BigDecimal thanhTienLo = item.getDonGia().multiply(BigDecimal.valueOf(layTuLoNay));
                tongTienHienTai = tongTienHienTai.add(thanhTienLo);
            }

            if (soLuongCanMua > 0) {
                throw new BusinessRuleException("Sản phẩm mã " + item.getMaLo() + " không đủ số lượng tồn kho!");
            }
        }

        hoaDon.setTongTien(tongTienHienTai);
        hoaDonRepository.save(hoaDon);

        HoaDonResponseDTO response = new HoaDonResponseDTO();
        response.setMaHd(hoaDon.getMaHd());
        response.setTongTien(hoaDon.getTongTien());

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<HoaDonResponseDTO> getAllHoaDon() {
        List<HoaDon> hoaDons = hoaDonRepository.findAll();

        return hoaDons.stream().map(hd -> {
            HoaDonResponseDTO dto = new HoaDonResponseDTO();
            dto.setMaHd(hd.getMaHd());
            dto.setNgayLap(hd.getNgayLap());

            // Đảm bảo hd.getTongTien() không bị null hoặc bằng 0 trong DB
            dto.setTongTien(hd.getTongTien() != null ? hd.getTongTien() : BigDecimal.ZERO);

            dto.setTrangThai(hd.getTrangThai() != null ? hd.getTrangThai().getValue() : null);

            if (hd.getKhachHang() != null) {
                dto.setTenKhachHang(hd.getKhachHang().getHoTen());
                dto.setSdtKhachHang(hd.getKhachHang().getSdt());
            }
            if (hd.getNhanSu() != null) {
                dto.setTenNhanVienLap(hd.getNhanSu().getHoTen());
            }

            if (hd.getCtHoaDons() != null) {
                List<HoaDonResponseDTO.ChiTietSanPhamResponse> listSp = hd.getCtHoaDons().stream().map(ct -> {
                    HoaDonResponseDTO.ChiTietSanPhamResponse sp = new HoaDonResponseDTO.ChiTietSanPhamResponse();
                    if (ct.getLoHang() != null && ct.getLoHang().getSanPham() != null) {
                        sp.setTenSanPham(ct.getLoHang().getSanPham().getTenSp());
                        sp.setMaLo(ct.getLoHang().getMaLo());
                    }
                    sp.setSoLuong(ct.getSoLuong());
                    sp.setDonGia(ct.getDonGia());
                    sp.setThanhTien(ct.getDonGia().multiply(BigDecimal.valueOf(ct.getSoLuong())));
                    return sp;
                }).toList();
                dto.setDanhSachSanPham(listSp);
            }

            if (hd.getCtHoaDonDvs() != null) {
                List<HoaDonResponseDTO.ChiTietDichVuResponse> listDv = hd.getCtHoaDonDvs().stream().map(ct -> {
                    HoaDonResponseDTO.ChiTietDichVuResponse dv = new HoaDonResponseDTO.ChiTietDichVuResponse();
                    if (ct.getDichVuKham() != null) {
                        dv.setTenDichVu(ct.getDichVuKham().getTenDv());
                    }
                    dv.setSoLuong(ct.getSoLuong());
                    dv.setDonGia(ct.getDonGia());
                    dv.setThanhTien(ct.getDonGia().multiply(BigDecimal.valueOf(ct.getSoLuong())));
                    return dv;
                }).toList();
                dto.setDanhSachDichVu(listDv);
            }
            return dto;
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PendingInvoiceResponseDTO> getPendingInvoices() {
        // 1. Get all active (not deleted) invoices to check billed status
        String jpqlActiveHoaDon = "SELECT DISTINCT hd FROM HoaDon hd LEFT JOIN FETCH hd.ctHoaDons " +
                                  "WHERE hd.isDeleted IS NULL OR hd.isDeleted = 0";
        List<HoaDon> activeInvoices = em.createQuery(jpqlActiveHoaDon, HoaDon.class).getResultList();

        // Build sets of billed keys
        java.util.Set<String> billedHoSoExams = new java.util.HashSet<>();
        java.util.Map<String, java.util.Set<String>> billedPrescriptionParts = new java.util.HashMap<>();

        for (HoaDon hd : activeInvoices) {
            if (hd.getHoSoThiLuc() != null) {
                billedHoSoExams.add(hd.getHoSoThiLuc().getMaHoSo());
            }
            if (hd.getPhieuKeDon() != null) {
                String maDon = hd.getPhieuKeDon().getMaDon();
                var parts = billedPrescriptionParts.computeIfAbsent(maDon, k -> new java.util.HashSet<>());
                if (hd.getCtHoaDons() != null) {
                    for (CtHoaDon ct : hd.getCtHoaDons()) {
                        if (ct.getLoHang() != null && ct.getLoHang().getSanPham() != null) {
                            Integer laThuoc = ct.getLoHang().getSanPham().getLaThuoc();
                            if (laThuoc != null) {
                                if (laThuoc == 1) parts.add("THUOC");
                                if (laThuoc == 0) parts.add("KINH");
                            }
                        }
                    }
                }
            }
        }

        // 2. Query all HoSoThiLuc
        String jpqlAllHoSo = "SELECT h FROM HoSoThiLuc h ORDER BY h.maHoSo DESC";
        List<HoSoThiLuc> allHoSos = em.createQuery(jpqlAllHoSo, HoSoThiLuc.class).getResultList();

        // 3. Query all PhieuKeDon
        String jpqlAllDon = "SELECT p FROM PhieuKeDon p ORDER BY p.maDon DESC";
        List<PhieuKeDon> allPrescriptions = em.createQuery(jpqlAllDon, PhieuKeDon.class).getResultList();

        // Map maHoSo to its PhieuKeDon
        java.util.Map<String, List<PhieuKeDon>> hoSoToPrescriptions = new java.util.HashMap<>();
        for (PhieuKeDon p : allPrescriptions) {
            if (p.getHoSoThiLuc() != null) {
                hoSoToPrescriptions.computeIfAbsent(p.getHoSoThiLuc().getMaHoSo(), k -> new ArrayList<>()).add(p);
            }
        }

        List<PendingInvoiceResponseDTO> list = new ArrayList<>();
        java.util.Set<String> addedPrescriptionThuoc = new java.util.HashSet<>();
        java.util.Set<String> addedPrescriptionKinh = new java.util.HashSet<>();

        // Loop HoSoThiLuc
        for (HoSoThiLuc hoSo : allHoSos) {
            String maHoSo = hoSo.getMaHoSo();
            List<PhieuKeDon> prescriptions = hoSoToPrescriptions.get(maHoSo);

            if (prescriptions != null && !prescriptions.isEmpty()) {
                for (PhieuKeDon p : prescriptions) {
                    // Check if prescription contains medicine (laThuoc = 1)
                    boolean hasMedicine = p.getChiTietKeDons() != null && p.getChiTietKeDons().stream().anyMatch(ct -> 
                        ct.getSanPham() != null && Integer.valueOf(1).equals(ct.getSanPham().getLaThuoc()));
                    
                    // Check if prescription contains glasses (laThuoc = 0)
                    boolean hasGlasses = p.getChiTietKeDons() != null && p.getChiTietKeDons().stream().anyMatch(ct -> 
                        ct.getSanPham() != null && Integer.valueOf(0).equals(ct.getSanPham().getLaThuoc()));

                    boolean isMedicineBilled = billedPrescriptionParts.getOrDefault(p.getMaDon(), java.util.Collections.emptySet()).contains("THUOC");
                    boolean isGlassesBilled = billedPrescriptionParts.getOrDefault(p.getMaDon(), java.util.Collections.emptySet()).contains("KINH");

                    if (hasMedicine && !isMedicineBilled) {
                        list.add(PendingInvoiceResponseDTO.builder()
                                .maKh(hoSo.getKhachHang() != null ? hoSo.getKhachHang().getMaKh() : null)
                                .tenKhachHang(hoSo.getKhachHang() != null ? hoSo.getKhachHang().getHoTen() : "Khách lẻ")
                                .sdtKhachHang(hoSo.getKhachHang() != null ? hoSo.getKhachHang().getSdt() : null)
                                .maHoSo(maHoSo)
                                .ngayKham(hoSo.getNgayKham() != null ? hoSo.getNgayKham().atStartOfDay() : null)
                                .maDon(p.getMaDon())
                                .maDonThuoc(p.getMaDon())
                                .ngayKeDon(p.getNgayKeDon())
                                .loaiKham("Khám & Đơn thuốc")
                                .build());
                        addedPrescriptionThuoc.add(p.getMaDon());
                    }

                    if (hasGlasses && !isGlassesBilled) {
                        list.add(PendingInvoiceResponseDTO.builder()
                                .maKh(hoSo.getKhachHang() != null ? hoSo.getKhachHang().getMaKh() : null)
                                .tenKhachHang(hoSo.getKhachHang() != null ? hoSo.getKhachHang().getHoTen() : "Khách lẻ")
                                .sdtKhachHang(hoSo.getKhachHang() != null ? hoSo.getKhachHang().getSdt() : null)
                                .maHoSo(maHoSo)
                                .ngayKham(hoSo.getNgayKham() != null ? hoSo.getNgayKham().atStartOfDay() : null)
                                .maDon(p.getMaDon())
                                .maDonKinh(p.getMaDon())
                                .ngayKeDon(p.getNgayKeDon())
                                .loaiKham("Khám & Đơn kính")
                                .build());
                        addedPrescriptionKinh.add(p.getMaDon());
                    }
                }
            } else {
                // If there's no prescription associated with this HoSo, check if exam itself is not billed
                if (!billedHoSoExams.contains(maHoSo)) {
                    list.add(PendingInvoiceResponseDTO.builder()
                            .maKh(hoSo.getKhachHang() != null ? hoSo.getKhachHang().getMaKh() : null)
                            .tenKhachHang(hoSo.getKhachHang() != null ? hoSo.getKhachHang().getHoTen() : "Khách lẻ")
                            .sdtKhachHang(hoSo.getKhachHang() != null ? hoSo.getKhachHang().getSdt() : null)
                            .maHoSo(maHoSo)
                            .ngayKham(hoSo.getNgayKham() != null ? hoSo.getNgayKham().atStartOfDay() : null)
                            .loaiKham("Khám mắt")
                            .build());
                }
            }
        }

        // Loop remaining prescriptions that were not processed/added above
        for (PhieuKeDon p : allPrescriptions) {
            String maDon = p.getMaDon();
            boolean hasMedicine = p.getChiTietKeDons() != null && p.getChiTietKeDons().stream().anyMatch(ct -> 
                ct.getSanPham() != null && Integer.valueOf(1).equals(ct.getSanPham().getLaThuoc()));
            boolean hasGlasses = p.getChiTietKeDons() != null && p.getChiTietKeDons().stream().anyMatch(ct -> 
                ct.getSanPham() != null && Integer.valueOf(0).equals(ct.getSanPham().getLaThuoc()));

            boolean isMedicineBilled = billedPrescriptionParts.getOrDefault(maDon, java.util.Collections.emptySet()).contains("THUOC");
            boolean isGlassesBilled = billedPrescriptionParts.getOrDefault(maDon, java.util.Collections.emptySet()).contains("KINH");

            String maKh = null;
            String tenKh = "Khách lẻ";
            String sdt = null;
            String maHoSo = null;
            LocalDateTime ngayKham = null;

            if (p.getHoSoThiLuc() != null) {
                maHoSo = p.getHoSoThiLuc().getMaHoSo();
                ngayKham = p.getHoSoThiLuc().getNgayKham() != null ? p.getHoSoThiLuc().getNgayKham().atStartOfDay() : null;
                if (p.getHoSoThiLuc().getKhachHang() != null) {
                    maKh = p.getHoSoThiLuc().getKhachHang().getMaKh();
                    tenKh = p.getHoSoThiLuc().getKhachHang().getHoTen();
                    sdt = p.getHoSoThiLuc().getKhachHang().getSdt();
                }
            }

            if (hasMedicine && !isMedicineBilled && !addedPrescriptionThuoc.contains(maDon)) {
                list.add(PendingInvoiceResponseDTO.builder()
                        .maKh(maKh)
                        .tenKhachHang(tenKh)
                        .sdtKhachHang(sdt)
                        .maHoSo(maHoSo)
                        .ngayKham(ngayKham)
                        .maDon(maDon)
                        .maDonThuoc(maDon)
                        .ngayKeDon(p.getNgayKeDon())
                        .loaiKham("Đơn thuốc")
                        .build());
            }

            if (hasGlasses && !isGlassesBilled && !addedPrescriptionKinh.contains(maDon)) {
                list.add(PendingInvoiceResponseDTO.builder()
                        .maKh(maKh)
                        .tenKhachHang(tenKh)
                        .sdtKhachHang(sdt)
                        .maHoSo(maHoSo)
                        .ngayKham(ngayKham)
                        .maDon(maDon)
                        .maDonKinh(maDon)
                        .ngayKeDon(p.getNgayKeDon())
                        .loaiKham("Đơn kính")
                        .build());
            }
        }

        return list;
    }
}
