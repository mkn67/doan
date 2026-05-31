package com.kada.da.modules.prescription.service;

import java.util.List;
import java.util.Map;
import java.sql.Types;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kada.da.modules.prescription.domain.PhieuKeDon;
import com.kada.da.modules.prescription.domain.CtKeDon;
import com.kada.da.modules.prescription.domain.CtKeDonId;
import com.kada.da.modules.prescription.domain.XuLyKinh;
import com.kada.da.modules.prescription.dto.PhieuKeDonRequestDTO;
import com.kada.da.modules.prescription.dto.PhieuKeDonResponseDTO;
import com.kada.da.modules.prescription.mapper.PhieuKeDonMapper;
import com.kada.da.modules.prescription.repository.PhieuKeDonRepository;
import com.kada.da.modules.prescription.repository.XuLyKinhRepository;
import com.kada.da.modules.staff.repository.NhanSuRepository;
import com.kada.da.modules.examination.repository.HoSoThiLucRepository;
import com.kada.da.modules.inventory.repository.SanPhamRepository;
import com.kada.da.modules.inventory.repository.LoHangRepository;
import com.kada.da.modules.prescription.repository.CtKeDonRepository;
import com.kada.da.Exception.BusinessRuleException;

import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PhieuKeDonServiceImpl implements PhieuKeDonService {

    private final PhieuKeDonRepository phieuKeDonRepository;
    private final NhanSuRepository nhanSuRepository;
    private final HoSoThiLucRepository hoSoThiLucRepository;
    private final SanPhamRepository sanPhamRepository;
    private final LoHangRepository loHangRepository;
    private final CtKeDonRepository ctKeDonRepository;
    private final XuLyKinhRepository xuLyKinhRepository;
    private final XuLyKinhService xuLyKinhService;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public PhieuKeDonResponseDTO taoDonThuoc(PhieuKeDonRequestDTO dto) {
        String maDon = "KD_" + dto.getMaHoSo();
        
        // Lấy phiếu kê đơn đã được tạo trước đó bởi thủ tục lưu hồ sơ, hoặc tạo mới nếu chưa có
        PhieuKeDon phieuKeDon = phieuKeDonRepository.findById(maDon)
                .orElseGet(() -> {
                    PhieuKeDon p = new PhieuKeDon();
                    p.setMaDon(maDon);
                    return p;
                });
        
        phieuKeDon.setHoSoThiLuc(hoSoThiLucRepository.findById(dto.getMaHoSo())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ thị lực: " + dto.getMaHoSo())));
        
        phieuKeDon.setNhanSu(nhanSuRepository.findById(dto.getMaNs())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ: " + dto.getMaNs())));

        phieuKeDon.setNgayKeDon(LocalDateTime.now());

        if (dto.getDanhSachKeDon() != null) {
            // Sắp xếp danh sách kê đơn theo mã sản phẩm tăng dần để tránh deadlock khi khóa hàng loạt
            List<PhieuKeDonRequestDTO.CtKeDonRequest> sortedList = dto.getDanhSachKeDon().stream()
                    .sorted((a, b) -> a.getMaSp().compareTo(b.getMaSp()))
                    .collect(Collectors.toList());

            // Xóa chi tiết cũ trước khi gán chi tiết mới để tránh trùng lặp hoặc mâu thuẫn dữ liệu
            if (phieuKeDon.getChiTietKeDons() != null && !phieuKeDon.getChiTietKeDons().isEmpty()) {
                ctKeDonRepository.deleteAllInBatch(phieuKeDon.getChiTietKeDons());
                phieuKeDon.getChiTietKeDons().clear();
            }

            List<CtKeDon> chiTietList = sortedList.stream().map(ctDto -> {
                CtKeDon ct = new CtKeDon();
                ct.setPhieuKeDon(phieuKeDon);
                
                // Sử dụng khóa bị quan (FOR UPDATE) trên hàng của sản phẩm cụ thể để đồng bộ luồng
                var sanPham = sanPhamRepository.findByIdWithWriteLock(ctDto.getMaSp())
                        .orElseThrow(() -> new BusinessRuleException("Không tìm thấy sản phẩm " + ctDto.getMaSp()));
                ct.setSanPham(sanPham);
                
                // Khởi tạo khóa phức tạp để tránh lỗi mapsId khi hibernate persist
                ct.setId(new CtKeDonId(phieuKeDon.getMaDon(), sanPham.getMaSp()));
                
                int reqQty = ctDto.getSoLuong() != null ? ctDto.getSoLuong() : 1;
                
                // Kiểm tra tồn kho tại thời điểm kê đơn (Tổng tồn kho vật lý)
                int totalStock = loHangRepository.getDanhSachLoFefo(ctDto.getMaSp()).stream()
                        .mapToInt(lh -> lh.getSoLuongTon() != null ? lh.getSoLuongTon() : 0)
                        .sum();
                
                // Lấy lượng đã đặt trước bởi các đơn thuốc chưa thanh toán/chưa lập hóa đơn khác
                int reservedQty = ctKeDonRepository.getReservedQuantity(ctDto.getMaSp());
                int availableStock = Math.max(0, totalStock - reservedQty);
                
                if (availableStock < reqQty) {
                    throw new BusinessRuleException("Sản phẩm " + sanPham.getTenSp() 
                            + " không đủ số lượng tồn kho khả dụng (Yêu cầu: " + reqQty 
                            + ", Vật lý: " + totalStock + ", Đã đặt trước: " + reservedQty 
                            + ", Khả dụng: " + availableStock + ")!");
                }
                
                ct.setSoLuong(reqQty);
                ct.setLieuDung(ctDto.getLieuDung());
                ct.setCachDung(ctDto.getCachDung());
                return ct;
            }).collect(Collectors.toList());
            phieuKeDon.setChiTietKeDons(chiTietList);
        }
        
        PhieuKeDon saved = phieuKeDonRepository.save(phieuKeDon);

        // === Tự động tạo phiếu xử lý kính nếu đơn có sản phẩm loại kính (laThuoc = 0) ===
        autoCreateXuLyKinhIfNeeded(saved);

        // === Tự động lập hóa đơn hoặc cập nhật hóa đơn cho đơn thuốc này ===
        createOrUpdateInvoiceForPrescription(saved);

        return mapToResponseDTO(saved);
    }

    @Override
    public List<PhieuKeDonResponseDTO> layDonThuocTheoHoSo(String maHoSo) {
        return phieuKeDonRepository.findByHoSoThiLuc_MaHoSoOrderByNgayKeDonDesc(maHoSo)
                .stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    private PhieuKeDonResponseDTO mapToResponseDTO(PhieuKeDon entity) {
        PhieuKeDonResponseDTO dto = PhieuKeDonMapper.toResponse(entity);
        if (entity.getChiTietKeDons() != null) {
            dto.setDanhSachKeDon(entity.getChiTietKeDons().stream().map(ct -> {
                PhieuKeDonResponseDTO.CtKeDonResponse ctDto = new PhieuKeDonResponseDTO.CtKeDonResponse();
                ctDto.setTenSanPham(ct.getSanPham().getTenSp());
                if (ct.getSanPham().getLoaiSanPham() != null) {
                    ctDto.setLoaiSanPham(ct.getSanPham().getLoaiSanPham().getTenLoai());
                }
                ctDto.setSoLuong(ct.getSoLuong());
                ctDto.setLieuDung(ct.getLieuDung());
                ctDto.setCachDung(ct.getCachDung());
                return ctDto;
            }).collect(Collectors.toList()));
        }
        return dto;
    }

    /**
     * Tá»± Ä‘á»™ng táº¡o phiáº¿u xá»­ lÃ½ kÃ­nh (XuLyKinh) khi phiáº¿u kÃª Ä‘Æ¡n chá»©a sáº£n pháº©m loáº¡i kÃ­nh.
     * Phiáº¿u sáº½ á»Ÿ tráº¡ng thÃ¡i "Chá» xá»­ lÃ½" vÃ  chÆ°a gÃ¡n KTV (KTV sáº½ tá»± nháº­n viá»‡c sau).
     */
    private void autoCreateXuLyKinhIfNeeded(PhieuKeDon saved) {
        if (saved.getChiTietKeDons() == null || saved.getChiTietKeDons().isEmpty()) {
            return;
        }

        boolean coSanPhamKinh = saved.getChiTietKeDons().stream()
                .anyMatch(ct -> ct.getSanPham() != null
                        && ct.getSanPham().getLaThuoc() != null
                        && ct.getSanPham().getLaThuoc() == 0);

        if (!coSanPhamKinh) {
            return; // Chá»‰ toÃ n thuá»‘c, khÃ´ng cáº§n táº¡o phiáº¿u gia cÃ´ng
        }

        // Kiá»ƒm tra Ä‘Ã£ cÃ³ phiáº¿u xá»­ lÃ½ kÃ­nh cho Ä‘Æ¡n nÃ y chÆ°a (trÃ¡nh táº¡o trÃ¹ng)
        List<XuLyKinh> existing = xuLyKinhRepository.findByPhieuKeDon_MaDon(saved.getMaDon());
        if (existing != null && !existing.isEmpty()) {
            log.info("ÄÆ¡n {} Ä‘Ã£ cÃ³ phiáº¿u xá»­ lÃ½ kÃ­nh, bá» qua táº¡o tá»± Ä‘á»™ng.", saved.getMaDon());
            return;
        }

        // Táº¡o thÃ´ng sá»‘ kÃ­nh tá»« Ä‘Æ¡n kÃª (danh sÃ¡ch tÃªn sáº£n pháº©m kÃ­nh)
        String thongSoKinh = saved.getChiTietKeDons().stream()
                .filter(ct -> ct.getSanPham() != null
                        && ct.getSanPham().getLaThuoc() != null
                        && ct.getSanPham().getLaThuoc() == 0)
                .map(ct -> ct.getSanPham().getTenSp() + " x" + ct.getSoLuong())
                .collect(Collectors.joining(", "));

        String maXl = xuLyKinhService.taoPhieuGiaoKinh(saved.getMaDon(), null, thongSoKinh);
        log.info("Auto-created XuLyKinh {} for prescription {} (glasses: {})",
                maXl, saved.getMaDon(), thongSoKinh);
    }

    // Hàm sinh mã phiếu kê đơn tự động
    private synchronized String generateMaDon() {
        String maxCode = phieuKeDonRepository.findMaxMaDon();
        if (maxCode == null || maxCode.length() < 3) {
            return "PK001";
        }
        try {
            int nextNumber = Integer.parseInt(maxCode.substring(2)) + 1;
            return "PK" + String.format("%03d", nextNumber);
        } catch (NumberFormatException e) {
            return "PK001";
        }
    }

    private void createOrUpdateInvoiceForPrescription(PhieuKeDon saved) {
        String maDon = saved.getMaDon();
        String maHoso = saved.getHoSoThiLuc().getMaHoSo();
        String maKh = saved.getHoSoThiLuc().getKhachHang().getMaKh();
        String maNs = saved.getNhanSu().getMaNs();

        // 1. Kiểm tra xem đã có hóa đơn nào cho đơn thuốc/hồ sơ này chưa
        String checkInvoiceSql = "SELECT MAHD, TRANGTHAI FROM HOA_DON WHERE MADON = ? AND (IS_DELETED = 0 OR IS_DELETED IS NULL)";
        List<Map<String, Object>> existingInvoices = jdbcTemplate.queryForList(checkInvoiceSql, maDon);

        for (Map<String, Object> inv : existingInvoices) {
            String maHd = (String) inv.get("MAHD");
            String trangThai = (String) inv.get("TRANGTHAI");

            if ("Đã thanh toán".equals(trangThai) || "Thành công".equals(trangThai)) {
                log.info("[AUTO-BILLING] Đơn thuốc {} đã có hóa đơn {} đã thanh toán. Bỏ qua tạo mới.", maDon, maHd);
                return; // Nếu đã thanh toán, không thay đổi gì cả
            } else {
                // Nếu chưa thanh toán, thực hiện hủy/xóa hóa đơn cũ để tránh trùng lặp
                log.info("[AUTO-BILLING] Hủy hóa đơn cũ chưa thanh toán {} cho đơn thuốc {}", maHd, maDon);
                jdbcTemplate.update("DELETE FROM CT_HOA_DON WHERE MAHD = ?", maHd);
                jdbcTemplate.update("DELETE FROM CT_HOA_DON_DV WHERE MAHD = ?", maHd);
                jdbcTemplate.update("DELETE FROM HOA_DON WHERE MAHD = ?", maHd);
            }
        }

        // 2. Kiểm tra danh sách sản phẩm trong đơn để quyết định tạo hóa đơn
        if (saved.getChiTietKeDons() == null || saved.getChiTietKeDons().isEmpty()) {
            log.info("[AUTO-BILLING] Đơn thuốc {} trống sản phẩm, không tự động tạo hóa đơn.", maDon);
            return;
        }

        try {
            // Lập 1 hóa đơn tổng hợp duy nhất gộp chung cả khám bệnh, thuốc và kính
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
                    cs.setString(8, "CA_HAI");
                    
                    cs.execute();
                    
                    String maHd = cs.getString(7);
                    log.info("[AUTO-BILLING] Đã tự động lập hóa đơn {} cho đơn thuốc {} (loại: CA_HAI)", maHd, maDon);
                    return maHd;
                }
            );
        } catch (Exception e) {
            log.error("Lỗi tự động tạo hóa đơn từ đơn thuốc {}: {}", maDon, e.getMessage(), e);
        }
    }

}
