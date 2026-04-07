package com.kada.da.Service.impl;

import com.kada.da.Dto.LoHangRequestDTO;
import com.kada.da.Dto.PhieuNhapRequestDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Dto.Response.PhieuNhapResponseDTO;
import com.kada.da.Entity.LoHang;
import com.kada.da.Entity.NhaCungCap;
import com.kada.da.Entity.NhanSu;
import com.kada.da.Entity.PhieuNhap;
import com.kada.da.Entity.SanPham;
import com.kada.da.Exception.BusinessRuleException;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.Repository.LoHangRepository;
import com.kada.da.Repository.NhaCungCapRepository;
import com.kada.da.Repository.NhanSuRepository;
import com.kada.da.Repository.PhieuNhapRepository;
import com.kada.da.Repository.SanPhamRepository;
import com.kada.da.Service.PhieuNhapService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.kada.da.Dto.Response.LoHangResponseDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PhieuNhapServiceImpl implements PhieuNhapService {

    private final PhieuNhapRepository phieuNhapRepository;
    private final LoHangRepository loHangRepository;
    private final NhaCungCapRepository nhaCungCapRepository;
    private final NhanSuRepository nhanSuRepository;
    private final SanPhamRepository sanPhamRepository;

    private static final String PREFIX = "PN";

    @Override
    @Transactional
    public PhieuNhapResponseDTO createPhieuNhap(PhieuNhapRequestDTO request) {
        log.info("Bắt đầu tạo phiếu nhập mới cho nhà cung cấp: {}", request.getMaNcc());

        // 1. Kiểm tra nhà cung cấp
        NhaCungCap nhaCungCap = nhaCungCapRepository.findById(request.getMaNcc())
                .orElseThrow(() -> new ResourceNotFoundException("Nhà cung cấp không tồn tại: " + request.getMaNcc()));

        // 2. Kiểm tra nhân viên
        NhanSu nhanSu = nhanSuRepository.findById(request.getMaNs())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại: " + request.getMaNs()));

        // 3. Kiểm tra danh sách lô hàng
        if (request.getLoHangList() == null || request.getLoHangList().isEmpty()) {
            throw new BusinessRuleException("Phiếu nhập phải có ít nhất một lô hàng");
        }

        // 4. Tạo phiếu nhập
        String maPn = generateMaPhieuNhap();
        PhieuNhap phieuNhap = PhieuNhap.builder()
                .maPn(maPn)
                .nhaCungCap(nhaCungCap)
                .nhanSu(nhanSu)
                .ngayNhap(LocalDateTime.now())
                .tongTien(BigDecimal.ZERO)
                .build();

        PhieuNhap savedPhieuNhap = phieuNhapRepository.save(phieuNhap);
        log.info("Đã tạo phiếu nhập với mã: {}", maPn);

        // 5. Xử lý từng lô hàng
        BigDecimal tongTien = BigDecimal.ZERO;
        List<LoHang> loHangList = new ArrayList<>();

        for (LoHangRequestDTO loHangDTO : request.getLoHangList()) {
            // Kiểm tra sản phẩm
            SanPham sanPham = sanPhamRepository.findById(loHangDTO.getMaSp())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại: " + loHangDTO.getMaSp()));

            // Kiểm tra ngày tháng
            if (loHangDTO.getNgayHetHan() != null && loHangDTO.getNgayHetHan().isBefore(LocalDate.now())) {
                throw new BusinessRuleException(
                        "Hạn sử dụng của sản phẩm " + sanPham.getTenSp() + " không thể là ngày trong quá khứ");
            }

            if (loHangDTO.getNgaySanXuat() != null && loHangDTO.getNgayHetHan() != null
                    && loHangDTO.getNgaySanXuat().isAfter(loHangDTO.getNgayHetHan())) {
                throw new BusinessRuleException(
                        "Ngày sản xuất phải trước ngày hết hạn của sản phẩm " + sanPham.getTenSp());
            }

            // Tạo lô hàng
            String maLo = generateMaLoHang();
            LoHang loHang = LoHang.builder()
                    .maLo(maLo)
                    .phieuNhap(savedPhieuNhap)
                    .sanPham(sanPham)
                    .ngaySanXuat(loHangDTO.getNgaySanXuat())
                    .ngayHetHan(loHangDTO.getNgayHetHan())
                    .soLuongNhap(loHangDTO.getSoLuongNhap())
                    .soLuongTon(loHangDTO.getSoLuongNhap())
                    .giaNhap(loHangDTO.getGiaNhap())
                    .build();

            loHangList.add(loHang);

            // Tính tổng tiền
            BigDecimal thanhTien = loHangDTO.getGiaNhap()
                    .multiply(BigDecimal.valueOf(loHangDTO.getSoLuongNhap()));
            tongTien = tongTien.add(thanhTien);
        }

        // 6. Lưu lô hàng
        loHangRepository.saveAll(loHangList);
        log.info("Đã lưu {} lô hàng cho phiếu nhập {}", loHangList.size(), maPn);

        // 7. Cập nhật tổng tiền
        savedPhieuNhap.setTongTien(tongTien);
        phieuNhapRepository.save(savedPhieuNhap);

        return convertToResponseDTO(savedPhieuNhap, loHangList);
    }

    @Override
    public PhieuNhapResponseDTO getPhieuNhapById(String maPn) {
        log.info("Lấy phiếu nhập theo mã: {}", maPn);

        PhieuNhap phieuNhap = phieuNhapRepository.findById(maPn)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiếu nhập với mã: " + maPn));

        List<LoHang> loHangList = loHangRepository.findByPhieuNhap_MaPn(maPn);

        return convertToResponseDTO(phieuNhap, loHangList);
    }

    @Override
    public PageResponseDTO<PhieuNhapResponseDTO> getAllPhieuNhap(int page, int size) {
        log.info("Lấy danh sách phiếu nhập - page: {}, size: {}", page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<PhieuNhap> phieuNhapPage = phieuNhapRepository.findAll(pageable);

        List<PhieuNhapResponseDTO> responseList = phieuNhapPage.getContent().stream()
                .map(pn -> {
                    List<LoHang> loHangList = loHangRepository.findByPhieuNhap_MaPn(pn.getMaPn());
                    return convertToResponseDTO(pn, loHangList);
                })
                .collect(Collectors.toList());

        return PageResponseDTO.<PhieuNhapResponseDTO>builder()
                .content(responseList)
                .pageNo(page)
                .pageSize(size)
                .totalElements(phieuNhapPage.getTotalElements())
                .totalPages(phieuNhapPage.getTotalPages())
                .last(phieuNhapPage.isLast())
                .build();
    }

    @Override
    public List<PhieuNhapResponseDTO> getPhieuNhapByNhaCungCap(String maNcc) {
        log.info("Lấy phiếu nhập theo nhà cung cấp: {}", maNcc);

        NhaCungCap nhaCungCap = nhaCungCapRepository.findById(maNcc)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà cung cấp không tồn tại: " + maNcc));

        List<PhieuNhap> phieuNhapList = phieuNhapRepository.findByNhaCungCapOrderByNgayNhapDesc(nhaCungCap);

        return phieuNhapList.stream()
                .map(pn -> {
                    List<LoHang> loHangList = loHangRepository.findByPhieuNhap_MaPn(pn.getMaPn());
                    return convertToResponseDTO(pn, loHangList);
                })
                .collect(Collectors.toList());
    }

    // ==================== PRIVATE METHODS ====================

    private String generateMaPhieuNhap() {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = PREFIX + today;

        String maxCode = phieuNhapRepository.findMaxMaPnByDate(today);
        int nextNumber = 1;

        if (maxCode != null && maxCode.length() > prefix.length()) {
            try {
                String numberPart = maxCode.substring(prefix.length());
                nextNumber = Integer.parseInt(numberPart) + 1;
            } catch (NumberFormatException e) {
                log.warn("Không thể parse số từ mã: {}", maxCode);
            }
        }

        return prefix + String.format("%04d", nextNumber);
    }

    private String generateMaLoHang() {
        return "LO" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }

    private PhieuNhapResponseDTO convertToResponseDTO(PhieuNhap phieuNhap, List<LoHang> loHangList) {
        return PhieuNhapResponseDTO.builder()
                .maPn(phieuNhap.getMaPn())
                .maNcc(phieuNhap.getNhaCungCap().getMaNcc())
                .tenNcc(phieuNhap.getNhaCungCap().getTenNcc())
                .maNs(phieuNhap.getNhanSu().getMaNs())
                .tenNhanVien(phieuNhap.getNhanSu().getHoTen())
                .ngayNhap(phieuNhap.getNgayNhap())
                .tongTien(phieuNhap.getTongTien())
                .loHangList(loHangList.stream()
                        .map(this::convertLoHangToDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    private LoHangResponseDTO convertLoHangToDTO(LoHang loHang) {
        return LoHangResponseDTO.builder()
                .maLo(loHang.getMaLo())
                .maSp(loHang.getSanPham().getMaSp())
                .tenSanPham(loHang.getSanPham().getTenSp())
                .ngaySanXuat(loHang.getNgaySanXuat())
                .ngayHetHan(loHang.getNgayHetHan())
                .soLuongNhap(loHang.getSoLuongNhap())
                .soLuongTon(loHang.getSoLuongTon())
                .giaNhap(loHang.getGiaNhap())
                .build();
    }
}