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
import com.kada.da.modules.billing.domain.HoaDon;
import com.kada.da.modules.billing.repository.HoaDonRepository;
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

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class XuLyKinhServiceImpl implements XuLyKinhService {

    // SỬA: dùng chuỗi UTF-8 đúng "Chờ xử lý"
    private static final String TRANG_THAI_CHO_XU_LY = "Chờ xử lý";

    private final XuLyKinhRepository xuLyKinhRepository;
    private final PhieuKeDonRepository phieuKeDonRepository;
    private final NhanSuRepository nhanSuRepository;
    private final LoHangRepository loHangRepository;
    private final HoaDonRepository hoaDonRepository;
    private final ObjectMapper objectMapper;

    // ========== PHƯƠNG THỨC CÔNG KHAI ==========

    @Override
    public XuLyKinhResponseDTO getXuLyKinhById(String maXl) {
        return toDTO(xuLyKinhRepository.findById(maXl)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu xử lý kính: " + maXl)));
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
        return xuLyKinhRepository.findByPhieuKeDon_MaDon(maDon).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<XuLyKinhResponseDTO> getXuLyKinhByTrangThai(String trangThai) {
        return xuLyKinhRepository.findByTrangThai(trangThai).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * 🔧 SỬA LỖI CHÍNH: thay thế chuỗi bị lỗi encoding bằng chuỗi đúng.
     * Chỉ lấy các đơn cần xử lý: Chờ xử lý, Đang xử lý, Lỗi gia công.
     */
    @Override
    public List<XuLyKinhResponseDTO> getXuLyKinhCanXuLy() {
        return xuLyKinhRepository.findByTrangThaiIn(List.of("Chờ xử lý", "Đang xử lý", "Lỗi gia công"))
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<XuLyKinhResponseDTO> getXuLyKinhByKyThuatAndTrangThai(String maKyThuat, String trangThai) {
        return xuLyKinhRepository.findByNhanSuKyThuat_MaNsAndTrangThai(maKyThuat, trangThai)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ========== PHƯƠNG THỨC TRANSACTIONAL ==========

    @Override
    @Transactional
    public String taoPhieuGiaoKinh(String maDon, String maNsKyThuat, String thongSoKinh) {
        List<XuLyKinh> existing = xuLyKinhRepository.findByPhieuKeDon_MaDon(maDon);
        if (existing != null && !existing.isEmpty()) {
            XuLyKinh xuLyKinh = existing.get(0);
            if (xuLyKinh.getNhanSuKyThuat() == null && maNsKyThuat != null && !maNsKyThuat.isBlank()) {
                xuLyKinh.setNhanSuKyThuat(nhanSuRepository.findById(maNsKyThuat)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân sự kỹ thuật: " + maNsKyThuat)));
                xuLyKinhRepository.save(xuLyKinh);
            }
            return xuLyKinh.getMaXl();
        }

        if (maNsKyThuat == null || maNsKyThuat.isBlank()) {
            PhieuKeDon phieuKeDon = phieuKeDonRepository.findById(maDon)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu kê đơn: " + maDon));

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

        log.info("Gọi SP_GIAO_XU_LY_KINH: đơn={}, ktv={}", maDon, maNsKyThuat);
        String maXl = xuLyKinhRepository.giaoXuLyKinh(maDon, maNsKyThuat, thongSoKinh);
        log.info("Đã tạo phiếu xử lý kính thành công, mã: {}", maXl);
        return maXl;
    }

    @Override
    @Transactional
    public XuLyKinhResponseDTO createXuLyKinh(XuLyKinhRequestDTO request) {
        String thongSoKinhStr = "";
        try {
            if (request.getThongSoKinh() != null) {
                thongSoKinhStr = objectMapper.writeValueAsString(request.getThongSoKinh());
            }
        } catch (Exception e) {
            log.error("Lỗi parse JSON thongSoKinh: ", e);
        }
        String maXl = taoPhieuGiaoKinh(request.getMaDon(), request.getMaNsKyThuat(), thongSoKinhStr);

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

    @Override
    @Transactional
    public XuLyKinhResponseDTO updateThongSoKinh(String maXl, Object thongSoKinh) {
        XuLyKinh existing = xuLyKinhRepository.findById(maXl)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu xử lý kính: " + maXl));
        try {
            existing.setThongSoKinh(objectMapper.writeValueAsString(thongSoKinh));
        } catch (Exception e) {
            log.error("Lỗi parse JSON thông số kính: ", e);
            throw new BusinessRuleException("Dữ liệu thông số kính không hợp lệ!");
        }
        return toDTO(xuLyKinhRepository.save(existing));
    }

    @Override
    @Transactional
    public XuLyKinhResponseDTO updateTrangThai(String maXl, String trangThai) {
        XuLyKinh existing = xuLyKinhRepository.findById(maXl)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu xử lý kính: " + maXl));
        existing.setTrangThai(trangThai);

        if ("Hoàn thành".equalsIgnoreCase(trangThai) || "Đã xong".equalsIgnoreCase(trangThai)) {
            existing.setNgayHoanThanh(LocalDateTime.now());
        }
        return toDTO(xuLyKinhRepository.save(existing));
    }

    @Override
    @Transactional
    public XuLyKinhResponseDTO batDauXuLy(String maXl, String maKyThuat) {
        XuLyKinh existing = xuLyKinhRepository.findById(maXl)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu: " + maXl));

        if (maKyThuat != null && !maKyThuat.isBlank()) {
            existing.setNhanSuKyThuat(nhanSuRepository.findById(maKyThuat)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân sự kỹ thuật: " + maKyThuat)));
        }
        existing.setNgayBatDau(LocalDateTime.now());
        return toDTO(xuLyKinhRepository.save(existing));
    }

    @Override
    @Transactional
    public XuLyKinhResponseDTO hoanThanhXuLy(String maXl) {
        return updateTrangThai(maXl, "Hoàn thành");
    }

    @Override
    @Transactional
    public XuLyKinhResponseDTO huyXuLy(String maXl, String lyDo) {
        XuLyKinh existing = xuLyKinhRepository.findById(maXl)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu: " + maXl));
        existing.setTrangThai("Đã hủy");
        existing.setGhiChu(lyDo);

        // Xử lý hao hụt kho nếu lý do là lỗi gia công
        boolean isMfgError = lyDo != null && (
            lyDo.toLowerCase().contains("lỗi") ||
            lyDo.toLowerCase().contains("hỏng") ||
            lyDo.toLowerCase().contains("vỡ") ||
            lyDo.toLowerCase().contains("mài") ||
            lyDo.toLowerCase().contains("lắp") ||
            lyDo.toLowerCase().contains("damage") ||
            lyDo.toLowerCase().contains("error") ||
            lyDo.toLowerCase().contains("breakage")
        );

        if (isMfgError && existing.getPhieuKeDon() != null) {
            List<CtKeDon> details = existing.getPhieuKeDon().getChiTietKeDons();
            if (details != null) {
                for (CtKeDon detail : details) {
                    SanPham sp = detail.getSanPham();
                    if (sp != null && (sp.getLaThuoc() == null || sp.getLaThuoc() == 0)) {
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

                            log.info("[AUDIT_LOG] KTV báo hỏng kính. Đã khấu hao 1 sản phẩm {} từ lô {} theo FIFO.", sp.getMaSp(), lo.getMaLo());

                            try {
                                java.nio.file.Files.writeString(
                                    java.nio.file.Paths.get("waste_report.log"),
                                    String.format("[%s] [WASTE_REPORT_LOG] Kính lỗi mài lắp - Phiếu XL: %s, Mã SP: %s, Tên SP: %s, Lô khấu hao: %s, Số lượng: 1, Lý do: %s\n",
                                        LocalDateTime.now(), maXl, sp.getMaSp(), sp.getTenSp(), lo.getMaLo(), lyDo),
                                    java.nio.file.StandardOpenOption.CREATE,
                                    java.nio.file.StandardOpenOption.APPEND
                                );
                            } catch (Exception ex) {
                                log.error("Lỗi ghi file waste_report.log: ", ex);
                            }
                        } else {
                            log.warn("[AUDIT_LOG] KTV báo hỏng sản phẩm {} nhưng không còn lô hàng nào có tồn kho để khấu hao.", sp.getMaSp());
                        }
                    }
                }
            }
        }

        return toDTO(xuLyKinhRepository.save(existing));
    }

    // ========== PHƯƠNG THỨC HỖ TRỢ ==========

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
        if (entity.getPhieuKeDon() != null && entity.getPhieuKeDon().getHoSoThiLuc() != null
                && entity.getPhieuKeDon().getHoSoThiLuc().getKhachHang() != null) {
            tenKhachHang = entity.getPhieuKeDon().getHoSoThiLuc().getKhachHang().getHoTen();
        }

        Object thongSoObj = null;
        try {
            if (entity.getThongSoKinh() != null && !entity.getThongSoKinh().isEmpty()) {
                thongSoObj = objectMapper.readValue(entity.getThongSoKinh(), Object.class);
            }
        } catch (Exception e) {
            thongSoObj = entity.getThongSoKinh();
        }

        String maHd = null;
        String trangThaiThanhToan = "Chưa lập hóa đơn";
        if (entity.getPhieuKeDon() != null) {
            String maDon = entity.getPhieuKeDon().getMaDon();
            List<HoaDon> hoaDons = hoaDonRepository.findByPhieuKeDon_MaDon(maDon);
            if (hoaDons != null && !hoaDons.isEmpty()) {
                HoaDon activeHd = hoaDons.stream()
                        .filter(hd -> hd.getIsDeleted() == null || hd.getIsDeleted() == 0)
                        .findFirst().orElse(null);
                if (activeHd != null) {
                    maHd = activeHd.getMaHd();
                    trangThaiThanhToan = activeHd.getTrangThai() != null ? activeHd.getTrangThai().getValue() : "Chưa thanh toán";
                }
            }
        }

        return XuLyKinhResponseDTO.builder()
                .maXl(entity.getMaXl())
                .maDon(entity.getPhieuKeDon() != null ? entity.getPhieuKeDon().getMaDon() : null)
                .tenKhachHang(tenKhachHang)
                .tenKyThuatVien(entity.getNhanSuKyThuat() != null ? entity.getNhanSuKyThuat().getHoTen() : null)
                .trangThai(entity.getTrangThai())
                .maHd(maHd)
                .trangThaiThanhToan(trangThaiThanhToan)
                .ngayBatDau(entity.getNgayBatDau())
                .ngayHoanThanh(entity.getNgayHoanThanh())
                .ghiChu(entity.getGhiChu())
                .thongSoKinh(thongSoObj)
                .build();
    }
}