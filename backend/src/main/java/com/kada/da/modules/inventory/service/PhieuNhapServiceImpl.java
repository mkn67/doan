package com.kada.da.modules.inventory.service;

import com.kada.da.Exception.BusinessRuleException;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.modules.inventory.domain.LoHang;
import com.kada.da.modules.inventory.domain.NhaCungCap;
import com.kada.da.modules.inventory.domain.PhieuNhap;
import com.kada.da.modules.inventory.domain.SanPham;
import com.kada.da.modules.inventory.dto.LoHangRequestDTO;
import com.kada.da.modules.inventory.dto.LoHangResponseDTO;
import com.kada.da.modules.inventory.dto.PhieuNhapRequestDTO;
import com.kada.da.modules.inventory.dto.PhieuNhapResponseDTO;
import com.kada.da.modules.inventory.repository.LoHangRepository;
import com.kada.da.modules.inventory.repository.NhaCungCapRepository;
import com.kada.da.modules.inventory.repository.PhieuNhapRepository;
import com.kada.da.modules.inventory.repository.SanPhamRepository;
import com.kada.da.modules.staff.domain.NhanSu;
import com.kada.da.modules.staff.dto.PageResponseDTO;
import com.kada.da.modules.staff.repository.NhanSuRepository;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PhieuNhapServiceImpl implements PhieuNhapService {

    private final PhieuNhapRepository phieuNhapRepository;
    private final LoHangRepository loHangRepository;
    private final NhaCungCapRepository nhaCungCapRepository;
    private final NhanSuRepository nhanSuRepository;
    private final SanPhamRepository sanPhamRepository;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public PhieuNhapResponseDTO nhapKhoHoanChinh(PhieuNhapRequestDTO request) {
        if (request.getLoHangList() == null || request.getLoHangList().isEmpty()) {
            throw new BusinessRuleException("Danh sach san pham nhap kho khong duoc de trong!");
        }

        NhaCungCap nhaCungCap = nhaCungCapRepository.findById(request.getMaNcc())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay nha cung cap: " + request.getMaNcc()));
        NhanSu nhanSu = findNhanSuByMaOrUsername(request.getMaNs());

        PhieuNhap phieuNhap = PhieuNhap.builder()
                .maPn(nextCode("SEQ_PHIEU_NHAP", "PN"))
                .nhaCungCap(nhaCungCap)
                .nhanSu(nhanSu)
                .ngayNhap(LocalDateTime.now())
                .tongTien(BigDecimal.ZERO)
                .build();
        phieuNhapRepository.save(phieuNhap);

        BigDecimal tongTien = BigDecimal.ZERO;
        for (LoHangRequestDTO lo : request.getLoHangList()) {
            validateLoHang(lo);

            SanPham sanPham = sanPhamRepository.findById(lo.getMaSp())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay san pham: " + lo.getMaSp()));
            BigDecimal giaNhap = lo.getGiaNhap() != null ? lo.getGiaNhap() : BigDecimal.ZERO;

            LoHang loHang = LoHang.builder()
                    .maLo(nextCode("SEQ_LO_HANG", "LO"))
                    .sanPham(sanPham)
                    .phieuNhap(phieuNhap)
                    .ngaySanXuat(lo.getNgaySanXuat())
                    .ngayHetHan(lo.getNgayHetHan())
                    .soLuongNhap(lo.getSoLuongNhap())
                    .soLuongTon(lo.getSoLuongNhap())
                    .giaNhap(giaNhap)
                    .build();
            loHangRepository.save(loHang);

            tongTien = tongTien.add(giaNhap.multiply(BigDecimal.valueOf(lo.getSoLuongNhap())));
        }

        phieuNhap.setTongTien(tongTien);
        phieuNhapRepository.save(phieuNhap);
        log.info("Nhap kho thanh cong: {}", phieuNhap.getMaPn());
        return getPhieuNhapById(phieuNhap.getMaPn());
    }

    @Override
    public PhieuNhapResponseDTO getPhieuNhapById(String maPn) {
        PhieuNhap entity = phieuNhapRepository.findById(maPn)
                .orElseThrow(() -> new RuntimeException("Khong tim thay phieu nhap voi ma: " + maPn));
        return toDTO(entity);
    }

    @Override
    public PageResponseDTO<PhieuNhapResponseDTO> getAllPhieuNhap(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("ngayNhap").descending());
        Page<PhieuNhap> pageResult = phieuNhapRepository.findAll(pageable);

        List<PhieuNhapResponseDTO> dtos = pageResult.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PageResponseDTO.<PhieuNhapResponseDTO>builder()
                .content(dtos)
                .pageNo(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    @Override
    public List<PhieuNhapResponseDTO> getPhieuNhapByNhaCungCap(String maNcc) {
        NhaCungCap ncc = new NhaCungCap();
        ncc.setMaNcc(maNcc);
        return phieuNhapRepository.findByNhaCungCapOrderByNgayNhapDesc(ncc).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private void validateLoHang(LoHangRequestDTO lo) {
        if (lo.getNgayHetHan() != null) {
            if (lo.getNgaySanXuat() != null && !lo.getNgayHetHan().isAfter(lo.getNgaySanXuat())) {
                throw new BusinessRuleException("HSD phai sau NSX!");
            }
            if (!lo.getNgayHetHan().isAfter(LocalDate.now())) {
                throw new BusinessRuleException("Khong nhap hang het han!");
            }
        }
        if (lo.getSoLuongNhap() == null || lo.getSoLuongNhap() <= 0) {
            throw new BusinessRuleException("So luong nhap phai lon hon 0!");
        }
    }

    private NhanSu findNhanSuByMaOrUsername(String maNsOrUsername) {
        return nhanSuRepository.findById(maNsOrUsername)
                .or(() -> nhanSuRepository.findByTaiKhoanUsername(maNsOrUsername))
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay nhan su: " + maNsOrUsername));
    }

    private PhieuNhapResponseDTO toDTO(PhieuNhap entity) {
        List<LoHang> loHangs = entity.getDanhSachLoHang() != null
                ? entity.getDanhSachLoHang()
                : loHangRepository.findByPhieuNhap_MaPn(entity.getMaPn());

        List<LoHangResponseDTO> loHangDTOs = loHangs.stream()
                .map(com.kada.da.modules.inventory.mapper.LoHangMapper::toResponse)
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

    private String nextCode(String sequenceName, String prefix) {
        Number nextVal = (Number) entityManager
                .createNativeQuery("SELECT " + sequenceName + ".NEXTVAL FROM dual")
                .getSingleResult();
        return prefix + String.format("%06d", nextVal.longValue());
    }
}
