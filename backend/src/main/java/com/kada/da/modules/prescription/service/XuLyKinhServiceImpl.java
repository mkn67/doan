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
import com.kada.da.modules.prescription.domain.XuLyKinh;
import com.kada.da.modules.prescription.dto.XuLyKinhRequestDTO;
import com.kada.da.modules.prescription.dto.XuLyKinhResponseDTO;
import com.kada.da.modules.prescription.repository.XuLyKinhRepository;
import com.kada.da.modules.staff.dto.PageResponseDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class XuLyKinhServiceImpl implements XuLyKinhService {

    private final XuLyKinhRepository xuLyKinhRepository;
    private final LoHangRepository loHangRepository;
    private final ObjectMapper objectMapper; // Dùng để ép cục JSON thông số kính thành String

    @Override
    @Transactional
    public String taoPhieuGiaoKinh(String maDon, String maNsKyThuat, String thongSoKinh) {
        log.info("Gọi SP_GIAO_XU_LY_KINH: đơn={}, ktv={}", maDon, maNsKyThuat);

        // Chuyền bóng thẳng cho Oracle lo liệu!
        String maXl = xuLyKinhRepository.giaoXuLyKinh(maDon, maNsKyThuat, thongSoKinh);

        log.info("Đã tạo phiếu xử lý kính thành công, mã: {}", maXl);
        return maXl; // Frontend rất thích cái mã này để mở chi tiết
    }

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
        return xuLyKinhRepository.findByPhieuKeDon_MaDon(maDon).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<XuLyKinhResponseDTO> getXuLyKinhByTrangThai(String trangThai) {
        return xuLyKinhRepository.findByTrangThai(trangThai).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<XuLyKinhResponseDTO> getXuLyKinhCanXuLy() {
        return xuLyKinhRepository.findByTrangThaiIn(List.of("Chờ xử lý", "Đang xử lý", "Lỗi gia công", "Hoàn thành")).stream()
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

        // Tự động chốt giờ nếu hoàn thành
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

        // Logic cũ dùng JPA, nếu muốn đồng bộ SP thì nên gọi SP tương ứng ở đây
        existing.setNgayBatDau(LocalDateTime.now()); // Ghi nhận giờ bắt đầu cắt kính

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

        // Check if the cancellation reason is a manufacturing error (lỗi mài/lắp)
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

                            log.info("[AUDIT_LOG] KTV báo hỏng kính. Đã khấu hao 1 sản phẩm {} từ lô {} theo cơ chế FIFO.", sp.getMaSp(), lo.getMaLo());

                            // Write to a dedicated waste report log file
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
            log.error("Lỗi parse JSON thongSoKinh: ", e);
        }
        String maXl = taoPhieuGiaoKinh(request.getMaDon(), request.getMaNsKyThuat(), thongSoKinhStr);
        
        // Cập nhật thêm trạng thái và ghi chú nếu được truyền từ form
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

    private XuLyKinhResponseDTO toDTO(XuLyKinh entity) {
        String tenKhachHang = null;

        // Trích xuất an toàn Tên khách hàng từ PhieuKeDon
        if (entity.getPhieuKeDon() != null && entity.getPhieuKeDon().getHoSoThiLuc() != null) {
            // Giả sử HoSoThiLuc của ông có nối với KhachHang để lấy tên
            if (entity.getPhieuKeDon().getHoSoThiLuc().getKhachHang() != null) {
                tenKhachHang = entity.getPhieuKeDon().getHoSoThiLuc().getKhachHang().getHoTen();
            }
        }

        // Chuyển ngược chuỗi JSON trong DB thành Object để nhét vào DTO
        Object thongSoObj = null;
        try {
            if (entity.getThongSoKinh() != null && !entity.getThongSoKinh().isEmpty()) {
                thongSoObj = objectMapper.readValue(entity.getThongSoKinh(), Object.class);
            }
        } catch (Exception e) {
            thongSoObj = entity.getThongSoKinh(); // Lỡ lỗi thì trả nguyên chuỗi
        }

        return XuLyKinhResponseDTO.builder()
                .maXl(entity.getMaXl())
                .maDon(entity.getPhieuKeDon() != null ? entity.getPhieuKeDon().getMaDon() : null)
                .tenKhachHang(tenKhachHang) // Lấy từ Hồ Sơ (thay vì Hóa Đơn vì xử lý kính nối với Đơn Thuốc)
                .tenKyThuatVien(entity.getNhanSuKyThuat() != null ? entity.getNhanSuKyThuat().getHoTen() : null)
                .trangThai(entity.getTrangThai())
                .ngayBatDau(entity.getNgayBatDau())
                .ngayHoanThanh(entity.getNgayHoanThanh())
                .ghiChu(entity.getGhiChu())
                .thongSoKinh(thongSoObj) // Đã chuyển thành Object siêu xịn
                .build();
    }
}
