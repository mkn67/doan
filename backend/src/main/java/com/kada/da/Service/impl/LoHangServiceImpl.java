package com.kada.da.Service.impl;

import com.kada.da.Dto.LoHangRequestDTO;
import com.kada.da.Dto.Response.LoHangResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Entity.LoHang;
import com.kada.da.Entity.SanPham;
import com.kada.da.Exception.BusinessRuleException;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.Repository.LoHangRepository;
import com.kada.da.Repository.SanPhamRepository;
import com.kada.da.Service.LoHangService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoHangServiceImpl implements LoHangService {

    private final LoHangRepository loHangRepository;
    private final SanPhamRepository sanPhamRepository;

    @Override
    @Transactional
    public LoHangResponseDTO createLoHang(LoHangRequestDTO request) {
        log.info("Tạo lô hàng mới cho sản phẩm: {}", request.getMaSp());

        SanPham sanPham = sanPhamRepository.findById(request.getMaSp())
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại: " + request.getMaSp()));

        // Kiểm tra hạn sử dụng
        if (request.getNgayHetHan() != null && request.getNgayHetHan().isBefore(LocalDate.now())) {
            throw new BusinessRuleException("Hạn sử dụng không thể là ngày trong quá khứ");
        }

        if (request.getNgaySanXuat() != null && request.getNgayHetHan() != null
                && request.getNgaySanXuat().isAfter(request.getNgayHetHan())) {
            throw new BusinessRuleException("Ngày sản xuất phải trước ngày hết hạn");
        }

        LoHang loHang = LoHang.builder()
                .maLo(generateMaLoHang())
                .sanPham(sanPham)
                .ngaySanXuat(request.getNgaySanXuat())
                .ngayHetHan(request.getNgayHetHan())
                .soLuongNhap(request.getSoLuongNhap())
                .soLuongTon(request.getSoLuongNhap()) // Ban đầu tồn = nhập
                .giaNhap(request.getGiaNhap())
                .build();

        LoHang saved = loHangRepository.save(loHang);
        log.info("Đã tạo lô hàng với mã: {}", saved.getMaLo());

        return convertToResponseDTO(saved);
    }

    @Override
    public LoHangResponseDTO getLoHangById(String maLo) {
        log.info("Lấy lô hàng theo mã: {}", maLo);
        LoHang loHang = findById(maLo);
        return convertToResponseDTO(loHang);
    }

    @Override
    public PageResponseDTO<LoHangResponseDTO> getAllLoHang(int page, int size) {
        log.info("Lấy danh sách lô hàng - page: {}, size: {}", page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<LoHang> loHangPage = loHangRepository.findAll(pageable);

        List<LoHangResponseDTO> responseList = loHangPage.getContent().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());

        return PageResponseDTO.<LoHangResponseDTO>builder()
                .content(responseList)
                .pageNo(page)
                .pageSize(size)
                .totalElements(loHangPage.getTotalElements())
                .totalPages(loHangPage.getTotalPages())
                .last(loHangPage.isLast())
                .build();
    }

    @Override
    public List<LoHangResponseDTO> getLoHangBySanPham(String maSp) {
        log.info("Lấy lô hàng theo sản phẩm: {}", maSp);

        SanPham sanPham = sanPhamRepository.findById(maSp)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại: " + maSp));

        List<LoHang> loHangList = loHangRepository.findBySanPham(sanPham);
        return loHangList.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LoHangResponseDTO> getLoHangSapHetHan() {
        log.info("Lấy danh sách lô hàng sắp hết hạn (30 ngày tới)");

        LocalDate today = LocalDate.now();
        LocalDate expiryThreshold = today.plusDays(30);

        List<LoHang> loHangList = loHangRepository.findByNgayHetHanBetweenAndSoLuongTonGreaterThan(
                today, expiryThreshold, 0);

        return loHangList.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LoHangResponseDTO> getLoHangSapHetSoLuong(int nguong) {
        log.info("Lấy danh sách lô hàng sắp hết số lượng (ngưỡng: {})", nguong);

        List<LoHang> loHangList = loHangRepository.findBySoLuongTonGreaterThan(0);
        return loHangList.stream()
                .filter(lo -> lo.getSoLuongTon() <= nguong)
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LoHangResponseDTO updateSoLuongTon(String maLo, Integer soLuongBan) {
        log.info("Cập nhật tồn kho lô hàng: {}, bán: {}", maLo, soLuongBan);

        LoHang loHang = findById(maLo);

        if (soLuongBan > loHang.getSoLuongTon()) {
            throw new BusinessRuleException("Số lượng bán vượt quá tồn kho hiện tại");
        }

        loHang.setSoLuongTon(loHang.getSoLuongTon() - soLuongBan);
        LoHang updated = loHangRepository.save(loHang);

        log.info("Đã cập nhật tồn kho lô hàng {}: còn {} đơn vị", maLo, updated.getSoLuongTon());
        return convertToResponseDTO(updated);
    }

    @Override
    public List<LoHangResponseDTO> getLoHangConTon() {
        log.info("Lấy danh sách lô hàng còn tồn kho");

        List<LoHang> loHangList = loHangRepository.findBySoLuongTonGreaterThan(0);
        return loHangList.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ==================== PRIVATE METHODS ====================

    private LoHang findById(String maLo) {
        return loHangRepository.findById(maLo)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lô hàng với mã: " + maLo));
    }

    private String generateMaLoHang() {
        return "LO" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }

    private LoHangResponseDTO convertToResponseDTO(LoHang entity) {
        return LoHangResponseDTO.builder()
                .maLo(entity.getMaLo())
                .maSp(entity.getSanPham().getMaSp())
                .tenSanPham(entity.getSanPham().getTenSp())
                .ngaySanXuat(entity.getNgaySanXuat())
                .ngayHetHan(entity.getNgayHetHan())
                .soLuongNhap(entity.getSoLuongNhap())
                .soLuongTon(entity.getSoLuongTon())
                .giaNhap(entity.getGiaNhap())
                .build();
    }
}