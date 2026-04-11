package com.kada.da.Service.impl;

import com.kada.da.Dto.PhieuNhapRequestDTO;
import com.kada.da.Dto.LoHangRequestDTO;
import com.kada.da.Dto.Response.LoHangResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Dto.Response.PhieuNhapResponseDTO;
import com.kada.da.Entity.PhieuNhap;
import com.kada.da.Repository.PhieuNhapRepository;
import com.kada.da.Service.PhieuNhapService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PhieuNhapServiceImpl implements PhieuNhapService {

    private final PhieuNhapRepository phieuNhapRepository;

    @Override
    @Transactional
    public PhieuNhapResponseDTO nhapKhoHoanChinh(PhieuNhapRequestDTO request) {
        if (request.getLoHangList() == null || request.getLoHangList().isEmpty()) {
            throw new IllegalArgumentException("Danh sách sản phẩm nhập không được để trống!");
        }

        String currentMaPn = null; // Khởi tạo null để SP tạo Phiếu Nhập mới ở lô đầu tiên

        log.info("Bắt đầu nhập kho: NCC={}, Nhân viên={}", request.getMaNcc(), request.getMaNs());

        for (LoHangRequestDTO lo : request.getLoHangList()) {
            log.info("Đang xử lý lô hàng cho SP: {}, SL: {}", lo.getMaSp(), lo.getSoLuongNhap());

            // Gọi SP (Lần đầu currentMaPn = null, các lần sau sẽ mang mã phiếu vừa tạo)
            Map<String, Object> result = phieuNhapRepository.nhapKhoLoHang(
                    currentMaPn,
                    request.getMaNcc(),
                    request.getMaNs(),
                    null, // Để null cho Trigger Oracle tự sinh mã Lô
                    lo.getMaSp(),
                    lo.getNgaySanXuat(),
                    lo.getNgayHetHan(),
                    lo.getSoLuongNhap(),
                    // 👇 THẦN CHÚ CHỮA LỖI Ở ĐÂY: Ép BigDecimal về Double
                    lo.getGiaNhap() != null ? lo.getGiaNhap().doubleValue() : 0.0);
            // Cập nhật lại currentMaPn từ kết quả trả về của DB
            currentMaPn = (String) result.get("maPn");
        }

        log.info("Đã hoàn tất nạp các lô hàng vào Phiếu Nhập: {}", currentMaPn);

        // Trả về full thông tin phiếu nhập vừa tạo
        return getPhieuNhapById(currentMaPn);
    }

    @Override
    public PhieuNhapResponseDTO getPhieuNhapById(String maPn) {
        PhieuNhap entity = phieuNhapRepository.findById(maPn)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với mã: " + maPn));
        return toDTO(entity);
    }

    // Tớ tạo sẵn mấy cái vỏ này để ông khỏi bị lỗi đỏ ở interface, ông có thể tự
    // code ruột sau nhé
    @Override
    public PageResponseDTO<PhieuNhapResponseDTO> getAllPhieuNhap(int page, int size) {
        return null;
    }

    @Override
    public List<PhieuNhapResponseDTO> getPhieuNhapByNhaCungCap(String maNcc) {
        return null;
    }

    // ==================== PRIVATE METHOD ====================
    private PhieuNhapResponseDTO toDTO(PhieuNhap entity) {
        List<LoHangResponseDTO> loHangDTOs = entity.getDanhSachLoHang().stream()
                .map(lo -> LoHangResponseDTO.builder()
                        .maLo(lo.getMaLo())
                        .maSp(lo.getSanPham() != null ? lo.getSanPham().getMaSp() : null)
                        .tenSanPham(lo.getSanPham() != null ? lo.getSanPham().getTenSp() : null)
                        .ngaySanXuat(lo.getNgaySanXuat())
                        .ngayHetHan(lo.getNgayHetHan())
                        .soLuongNhap(lo.getSoLuongNhap())
                        .soLuongTon(lo.getSoLuongTon())
                        .giaNhap(lo.getGiaNhap())
                        .build())
                .collect(Collectors.toList());

        return PhieuNhapResponseDTO.builder()
                .maPn(entity.getMaPn())
                .maNcc(entity.getNhaCungCap() != null ? entity.getNhaCungCap().getMaNcc() : null)
                .tenNcc(entity.getNhaCungCap() != null ? entity.getNhaCungCap().getTenNcc() : null)
                .maNs(entity.getNhanSu() != null ? entity.getNhanSu().getMaNs() : null)
                .tenNhanVien(entity.getNhanSu() != null ? entity.getNhanSu().getHoTen() : null)
                .ngayNhap(entity.getNgayNhap())
                .tongTien(entity.getTongTien() != null ? entity.getTongTien() : BigDecimal.ZERO)
                .loHangList(loHangDTOs)
                .build();
    }
}