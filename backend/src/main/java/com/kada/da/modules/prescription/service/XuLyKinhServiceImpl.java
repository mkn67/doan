package com.kada.da.modules.prescription.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kada.da.Exception.BusinessRuleException;
import com.kada.da.modules.inventory.domain.LoHang;
import com.kada.da.modules.inventory.domain.SanPham;
import com.kada.da.modules.inventory.repository.LoHangRepository;
import com.kada.da.modules.prescription.domain.CtKeDon;
import com.kada.da.modules.prescription.domain.PhieuKeDon;
import com.kada.da.modules.prescription.domain.XuLyKinh;
import com.kada.da.modules.prescription.dto.XuLyKinhRequestDTO;
import com.kada.da.modules.prescription.dto.XuLyKinhResponseDTO;
import com.kada.da.modules.prescription.repository.PhieuKeDonRepository;
import com.kada.da.modules.prescription.repository.XuLyKinhRepository;
import com.kada.da.modules.staff.dto.PageResponseDTO;
import com.kada.da.modules.staff.repository.NhanSuRepository;
import com.kada.da.modules.billing.repository.HoaDonRepository;
import com.kada.da.modules.billing.domain.HoaDon;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class XuLyKinhServiceImpl implements XuLyKinhService {

    private static final String TRANG_THAI_CHO_XU_LY = "Ch\u00e1\u00bb\u009d x\u00e1\u00bb\u00ad l\u00c3\u00bd";

    private final XuLyKinhRepository xuLyKinhRepository;
    private final PhieuKeDonRepository phieuKeDonRepository;
    private final NhanSuRepository nhanSuRepository;
    private final LoHangRepository loHangRepository;
    private final HoaDonRepository hoaDonRepository;
    private final ObjectMapper objectMapper; // DÃ¹ng Ä‘á»ƒ Ã©p cá»¥c JSON thÃ´ng sá»‘ kÃ­nh thÃ nh String

    @Override
    @Transactional
    public String taoPhieuGiaoKinh(String maDon, String maNsKyThuat, String thongSoKinh) {
        List<XuLyKinh> existing = xuLyKinhRepository.findByPhieuKeDon_MaDon(maDon);
        if (existing != null && !existing.isEmpty()) {
            XuLyKinh xuLyKinh = existing.get(0);
            if (xuLyKinh.getNhanSuKyThuat() == null && maNsKyThuat != null && !maNsKyThuat.isBlank()) {
                xuLyKinh.setNhanSuKyThuat(nhanSuRepository.findById(maNsKyThuat)
                        .orElseThrow(() -> new RuntimeException("Khong tim thay nhan su ky thuat: " + maNsKyThuat)));
                xuLyKinhRepository.save(xuLyKinh);
            }
            return xuLyKinh.getMaXl();
        }

        if (maNsKyThuat == null || maNsKyThuat.isBlank()) {
            PhieuKeDon phieuKeDon = phieuKeDonRepository.findById(maDon)
                    .orElseThrow(() -> new RuntimeException("Khong tim thay phieu ke don: " + maDon));

            XuLyKinh xuLyKinh = XuLyKinh.builder()
                    .maXl(generateMaXl())
                    .phieuKeDon(phieuKeDon)
                    .thongSoKinh(thongSoKinh)
                    .trangThai(TRANG_THAI_CHO_XU_LY)
                    .ngayBatDau(null)
                    .ngayHoanThanh(null)
                    .nhanSuKyThuat(null)
                    .build();

            XuLyKinh saved = xuLyKinhRepository.save(xuLyKinh);
            log.info("Auto-created unassigned XuLyKinh {} for prescription {}", saved.getMaXl(), maDon);
            return saved.getMaXl();
        }
        log.info("Gá»i SP_GIAO_XU_LY_KINH: Ä‘Æ¡n={}, ktv={}", maDon, maNsKyThuat);

        // Chuyá»n bÃ³ng tháº³ng cho Oracle lo liá»‡u!
        String maXl = xuLyKinhRepository.giaoXuLyKinh(maDon, maNsKyThuat, thongSoKinh);

        log.info("ÄÃ£ táº¡o phiáº¿u xá»­ lÃ½ kÃ­nh thÃ nh cÃ´ng, mÃ£: {}", maXl);
        return maXl; // Frontend ráº¥t thÃ­ch cÃ¡i mÃ£ nÃ y Ä‘á»ƒ má»Ÿ chi tiáº¿t
    }

    @Override
    public XuLyKinhResponseDTO getXuLyKinhById(String maXl) {
        return toDTO(xuLyKinhRepository.findById(maXl)
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y phiáº¿u xá»­ lÃ½ kÃ­nh: " + maXl)));
    }

    @Override
    public PageResponseDTO<XuLyKinhResponseDTO> getAllXuLyKinh(int page, int size) {
        Page<XuLyKinh> pageResult = xuLyKinhRepository.findAll(PageRequest.of(page, size));
        List<XuLyKinhResponseDTO> content = pageResult.getContent().stream()
                .map(this::toDTO).collect(Collectors.toList());

        return PageResponseDTO.<XuLyKinhResponseDTO>builder()
                .content(content)
                .pageNo(page)
                .pageSize(size)
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    @Override
    public List<XuLyKinhResponseDTO> getXuLyKinhByMaDon(String maDon) {
        return xuLyKinhRepository.findByPhieuKeDon_MaDon(maDon).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<XuLyKinhResponseDTO> getXuLyKinhByTrangThai(String trangThai) {
        return xuLyKinhRepository.findByTrangThai(trangThai).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<XuLyKinhResponseDTO> getXuLyKinhCanXuLy() {
        return xuLyKinhRepository.findByTrangThaiIn(List.of("Chá» xá»­ lÃ½", "Äang xá»­ lÃ½", "Lá»—i gia cÃ´ng", "HoÃ n thÃ nh")).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<XuLyKinhResponseDTO> getXuLyKinhByKyThuatAndTrangThai(String maKyThuat, String trangThai) {
        return xuLyKinhRepository.findByNhanSuKyThuat_MaNsAndTrangThai(maKyThuat, trangThai)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public XuLyKinhResponseDTO updateThongSoKinh(String maXl, Object thongSoKinh) {
        XuLyKinh existing = xuLyKinhRepository.findById(maXl)
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y phiáº¿u xá»­ lÃ½ kÃ­nh: " + maXl));
        try {
            existing.setThongSoKinh(objectMapper.writeValueAsString(thongSoKinh));
        } catch (Exception e) {
            log.error("Lá»—i parse JSON thÃ´ng sá»‘ kÃ­nh: ", e);
            throw new BusinessRuleException("Dá»¯ liá»‡u thÃ´ng sá»‘ kÃ­nh khÃ´ng há»£p lá»‡!");
        }
        return toDTO(xuLyKinhRepository.save(existing));
    }

    @Override
    @Transactional
    public XuLyKinhResponseDTO updateTrangThai(String maXl, String trangThai) {
        XuLyKinh existing = xuLyKinhRepository.findById(maXl)
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y phiáº¿u xá»­ lÃ½ kÃ­nh: " + maXl));
        existing.setTrangThai(trangThai);

        // Tá»± Ä‘á»™ng chá»‘t giá» náº¿u hoÃ n thÃ nh
        if ("HoÃ n thÃ nh".equalsIgnoreCase(trangThai) || "ÄÃ£ xong".equalsIgnoreCase(trangThai)) {
            existing.setNgayHoanThanh(LocalDateTime.now());
        }
        return toDTO(xuLyKinhRepository.save(existing));
    }

    @Override
    @Transactional
    public XuLyKinhResponseDTO batDauXuLy(String maXl, String maKyThuat) {
        XuLyKinh existing = xuLyKinhRepository.findById(maXl)
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y phiáº¿u: " + maXl));

        // Logic cÅ© dÃ¹ng JPA, náº¿u muá»‘n Ä‘á»“ng bá»™ SP thÃ¬ nÃªn gá»i SP tÆ°Æ¡ng á»©ng á»Ÿ Ä‘Ã¢y
        if (maKyThuat != null && !maKyThuat.isBlank()) {
            existing.setNhanSuKyThuat(nhanSuRepository.findById(maKyThuat)
                    .orElseThrow(() -> new RuntimeException("Khong tim thay nhan su ky thuat: " + maKyThuat)));
        }
        existing.setNgayBatDau(LocalDateTime.now()); // Ghi nháº­n giá» báº¯t Ä‘áº§u cáº¯t kÃ­nh

        return toDTO(xuLyKinhRepository.save(existing));
    }

    @Override
    @Transactional
    public XuLyKinhResponseDTO hoanThanhXuLy(String maXl) {
        return updateTrangThai(maXl, "HoÃ n thÃ nh");
    }

    @Override
    @Transactional
    public XuLyKinhResponseDTO huyXuLy(String maXl, String lyDo) {
        XuLyKinh existing = xuLyKinhRepository.findById(maXl)
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y phiáº¿u: " + maXl));
        existing.setTrangThai("ÄÃ£ há»§y");
        existing.setGhiChu(lyDo);

        // Check if the cancellation reason is a manufacturing error (lá»—i mÃ i/láº¯p)
        boolean isMfgError = lyDo != null && (
            lyDo.toLowerCase().contains("lá»—i") ||
            lyDo.toLowerCase().contains("há»ng") ||
            lyDo.toLowerCase().contains("vá»¡") ||
            lyDo.toLowerCase().contains("mÃ i") ||
            lyDo.toLowerCase().contains("láº¯p") ||
            lyDo.toLowerCase().contains("damage") ||
            lyDo.toLowerCase().contains("error") ||
            lyDo.toLowerCase().contains("breakage")
        );

        if (isMfgError && existing.getPhieuKeDon() != null) {
            List<CtKeDon> details = existing.getPhieuKeDon().getChiTietKeDons();
            if (details != null) {
                for (CtKeDon detail : details) {
                    SanPham sp = detail.getSanPham();
                    // If it is a glass/lens product (laThuoc == 0 or null)
                    if (sp != null && (sp.getLaThuoc() == null || sp.getLaThuoc() == 0)) {
                        // Find active batches for this product and perform FIFO deduction
                        List<LoHang> activeBatches = loHangRepository.findBySanPham(sp).stream()
                                .filter(l -> l.getSoLuongTon() != null && l.getSoLuongTon() > 0)
                                .sorted((l1, l2) -> {
                                    if (l1.getNgaySanXuat() != null && l2.getNgaySanXuat() != null) {
                                        return l1.getNgaySanXuat().compareTo(l2.getNgaySanXuat());
                                    }
                                    return l1.getMaLo().compareTo(l2.getMaLo());
                                })
                                .collect(Collectors.toList());

                        if (!activeBatches.isEmpty()) {
                            LoHang lo = activeBatches.get(0);
                            lo.setSoLuongTon(lo.getSoLuongTon() - 1);
                            loHangRepository.save(lo);

                            log.info("[AUDIT_LOG] KTV bÃ¡o há»ng kÃ­nh. ÄÃ£ kháº¥u hao 1 sáº£n pháº©m {} tá»« lÃ´ {} theo cÆ¡ cháº¿ FIFO.", sp.getMaSp(), lo.getMaLo());

                            // Write to a dedicated waste report log file
                            try {
                                java.nio.file.Files.writeString(
                                    java.nio.file.Paths.get("waste_report.log"),
                                    String.format("[%s] [WASTE_REPORT_LOG] KÃ­nh lá»—i mÃ i láº¯p - Phiáº¿u XL: %s, MÃ£ SP: %s, TÃªn SP: %s, LÃ´ kháº¥u hao: %s, Sá»‘ lÆ°á»£ng: 1, LÃ½ do: %s\n",
                                        LocalDateTime.now(), maXl, sp.getMaSp(), sp.getTenSp(), lo.getMaLo(), lyDo),
                                    java.nio.file.StandardOpenOption.CREATE,
                                    java.nio.file.StandardOpenOption.APPEND
                                );
                            } catch (Exception ex) {
                                log.error("Lá»—i ghi file waste_report.log: ", ex);
                            }
                        } else {
                            log.warn("[AUDIT_LOG] KTV bÃ¡o há»ng sáº£n pháº©m {} nhÆ°ng khÃ´ng cÃ²n lÃ´ hÃ ng nÃ o cÃ³ tá»“n kho Ä‘á»ƒ kháº¥u hao.", sp.getMaSp());
                        }
                    }
                }
            }
        }

        return toDTO(xuLyKinhRepository.save(existing));
    }

    // ==================== PRIVATE METHODS ====================
    @Override
    @Transactional
    public XuLyKinhResponseDTO createXuLyKinh(XuLyKinhRequestDTO request) {
        String thongSoKinhStr = "";
        try {
            if (request.getThongSoKinh() != null) {
                thongSoKinhStr = objectMapper.writeValueAsString(request.getThongSoKinh());
            }
        } catch (Exception e) {
            log.error("Lá»—i parse JSON thongSoKinh: ", e);
        }
        String maXl = taoPhieuGiaoKinh(request.getMaDon(), request.getMaNsKyThuat(), thongSoKinhStr);
        
        // Cáº­p nháº­t thÃªm tráº¡ng thÃ¡i vÃ  ghi chÃº náº¿u Ä‘Æ°á»£c truyá»n tá»« form
        if (request.getTrangThai() != null && !request.getTrangThai().isEmpty()) {
            updateTrangThai(maXl, request.getTrangThai());
        }
        if (request.getGhiChu() != null && !request.getGhiChu().isEmpty()) {
            XuLyKinh existing = xuLyKinhRepository.findById(maXl).orElse(null);
            if (existing != null) {
                existing.setGhiChu(request.getGhiChu());
                xuLyKinhRepository.save(existing);
            }
        }
        
        return getXuLyKinhById(maXl);
    }

    private synchronized String generateMaXl() {
        String maxCode = xuLyKinhRepository.findMaxMaXl();
        if (maxCode == null || maxCode.length() < 3) {
            return "XL000001";
        }
        try {
            int nextNumber = Integer.parseInt(maxCode.substring(2)) + 1;
            return "XL" + String.format("%06d", nextNumber);
        } catch (NumberFormatException e) {
            return "XL000001";
        }
    }

    private XuLyKinhResponseDTO toDTO(XuLyKinh entity) {
        String tenKhachHang = null;

        // TrÃ­ch xuáº¥t an toÃ n TÃªn khÃ¡ch hÃ ng tá»« PhieuKeDon
        if (entity.getPhieuKeDon() != null && entity.getPhieuKeDon().getHoSoThiLuc() != null) {
            // Giáº£ sá»­ HoSoThiLuc cá»§a Ã´ng cÃ³ ná»‘i vá»›i KhachHang Ä‘á»ƒ láº¥y tÃªn
            if (entity.getPhieuKeDon().getHoSoThiLuc().getKhachHang() != null) {
                tenKhachHang = entity.getPhieuKeDon().getHoSoThiLuc().getKhachHang().getHoTen();
            }
        }

        // Chuyá»ƒn ngÆ°á»£c chuá»—i JSON trong DB thÃ nh Object Ä‘á»ƒ nhÃ©t vÃ o DTO
        Object thongSoObj = null;
        try {
            if (entity.getThongSoKinh() != null && !entity.getThongSoKinh().isEmpty()) {
                thongSoObj = objectMapper.readValue(entity.getThongSoKinh(), Object.class);
            }
        } catch (Exception e) {
            thongSoObj = entity.getThongSoKinh(); // Lá»¡ lá»—i thÃ¬ tráº£ nguyÃªn chuá»—i
        }

        String maHd = null;
        String trangThaiThanhToan = "ChÆ°a láº­p hÃ³a Ä‘Æ¡n";
        if (entity.getPhieuKeDon() != null) {
            String maDon = entity.getPhieuKeDon().getMaDon();
            List<HoaDon> hoaDons = hoaDonRepository.findByPhieuKeDon_MaDon(maDon);
            if (hoaDons != null && !hoaDons.isEmpty()) {
                HoaDon activeHd = hoaDons.stream()
                        .filter(hd -> hd.getIsDeleted() == null || hd.getIsDeleted() == 0)
                        .findFirst().orElse(null);
                if (activeHd != null) {
                    maHd = activeHd.getMaHd();
                    trangThaiThanhToan = activeHd.getTrangThai() != null ? activeHd.getTrangThai().getValue() : "ChÆ°a thanh toÃ¡n";
                }
            }
        }

        return XuLyKinhResponseDTO.builder()
                .maXl(entity.getMaXl())
                .maDon(entity.getPhieuKeDon() != null ? entity.getPhieuKeDon().getMaDon() : null)
                .tenKhachHang(tenKhachHang) // Láº¥y tá»« Há»“ SÆ¡ (thay vÃ¬ HÃ³a ÄÆ¡n vÃ¬ xá»­ lÃ½ kÃ­nh ná»‘i vá»›i ÄÆ¡n Thuá»‘c)
                .tenKyThuatVien(entity.getNhanSuKyThuat() != null ? entity.getNhanSuKyThuat().getHoTen() : null)
                .trangThai(entity.getTrangThai())
                .maHd(maHd)
                .trangThaiThanhToan(trangThaiThanhToan)
                .ngayBatDau(entity.getNgayBatDau())
                .ngayHoanThanh(entity.getNgayHoanThanh())
                .ghiChu(entity.getGhiChu())
                .thongSoKinh(thongSoObj) // ÄÃ£ chuyá»ƒn thÃ nh Object siÃªu xá»‹n
                .build();
    }
}
