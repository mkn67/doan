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
            String jsonDv) {
        log.info("Gọi SP_TAO_HOA_DON: khách={}, nhân viên={}", maKh, maNs);
        Map<String, String> result = hoaDonRepository.taoHoaDonTuJson(maKh, maNs, maHoso, maDon, jsonSp, jsonDv);
        log.info("Tạo hóa đơn thành công, mã: {}", result.get("maHd"));
        return result;
    }

    @Override
    @Transactional
    public void huyHoaDon(String maHd) {
        log.info("Gọi SP_HUY_HOA_DON: {}", maHd);
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
        String jpqlHoSo = "SELECT h FROM HoSoThiLuc h WHERE h.maHoSo NOT IN (" +
                          "  SELECT hd.hoSoThiLuc.maHoSo FROM HoaDon hd " +
                          "  WHERE hd.hoSoThiLuc IS NOT NULL AND (hd.isDeleted IS NULL OR hd.isDeleted = 0)" +
                          ") ORDER BY h.maHoSo DESC";
        List<HoSoThiLuc> pendingHoSos = em.createQuery(jpqlHoSo, HoSoThiLuc.class).getResultList();

        String jpqlDon = "SELECT p FROM PhieuKeDon p WHERE p.maDon NOT IN (" +
                         "  SELECT hd.phieuKeDon.maDon FROM HoaDon hd " +
                         "  WHERE hd.phieuKeDon IS NOT NULL AND (hd.isDeleted IS NULL OR hd.isDeleted = 0)" +
                         ") ORDER BY p.maDon DESC";
        List<PhieuKeDon> pendingDons = em.createQuery(jpqlDon, PhieuKeDon.class).getResultList();

        List<PendingInvoiceResponseDTO> list = new ArrayList<>();

        java.util.Map<String, PhieuKeDon> pendingDonsMap = new java.util.HashMap<>();
        for (PhieuKeDon don : pendingDons) {
            if (don.getHoSoThiLuc() != null) {
                pendingDonsMap.put(don.getHoSoThiLuc().getMaHoSo(), don);
            }
        }

        java.util.Set<String> mergedDonIds = new java.util.HashSet<>();

        for (HoSoThiLuc hoSo : pendingHoSos) {
            PendingInvoiceResponseDTO.PendingInvoiceResponseDTOBuilder builder = PendingInvoiceResponseDTO.builder()
                    .maKh(hoSo.getKhachHang() != null ? hoSo.getKhachHang().getMaKh() : null)
                    .tenKhachHang(hoSo.getKhachHang() != null ? hoSo.getKhachHang().getHoTen() : "Khách lẻ")
                    .sdtKhachHang(hoSo.getKhachHang() != null ? hoSo.getKhachHang().getSdt() : null)
                    .maHoSo(hoSo.getMaHoSo())
                    .ngayKham(hoSo.getNgayKham() != null ? hoSo.getNgayKham().atStartOfDay() : null);

            PhieuKeDon matchingDon = pendingDonsMap.get(hoSo.getMaHoSo());
            if (matchingDon != null) {
                builder.maDon(matchingDon.getMaDon())
                       .ngayKeDon(matchingDon.getNgayKeDon())
                       .loaiKham("Khám & Đơn kính/thuốc");
                mergedDonIds.add(matchingDon.getMaDon());
            } else {
                builder.loaiKham("Khám mắt");
            }

            list.add(builder.build());
        }

        for (PhieuKeDon don : pendingDons) {
            if (!mergedDonIds.contains(don.getMaDon())) {
                String maKh = null;
                String tenKh = "Khách lẻ";
                String sdt = null;
                if (don.getHoSoThiLuc() != null && don.getHoSoThiLuc().getKhachHang() != null) {
                    maKh = don.getHoSoThiLuc().getKhachHang().getMaKh();
                    tenKh = don.getHoSoThiLuc().getKhachHang().getHoTen();
                    sdt = don.getHoSoThiLuc().getKhachHang().getSdt();
                }

                list.add(PendingInvoiceResponseDTO.builder()
                        .maKh(maKh)
                        .tenKhachHang(tenKh)
                        .sdtKhachHang(sdt)
                        .maHoSo(don.getHoSoThiLuc() != null ? don.getHoSoThiLuc().getMaHoSo() : null)
                        .ngayKham(don.getHoSoThiLuc() != null && don.getHoSoThiLuc().getNgayKham() != null ? don.getHoSoThiLuc().getNgayKham().atStartOfDay() : null)
                        .maDon(don.getMaDon())
                        .ngayKeDon(don.getNgayKeDon())
                        .loaiKham("Đơn kính/thuốc")
                        .build());
            }
        }

        return list;
    }
}
