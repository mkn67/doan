package com.kada.da.modules.prescription.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kada.da.modules.prescription.domain.PhieuKeDon;
import com.kada.da.modules.prescription.domain.CtKeDon;
import com.kada.da.modules.prescription.dto.PhieuKeDonRequestDTO;
import com.kada.da.modules.prescription.dto.PhieuKeDonResponseDTO;
import com.kada.da.modules.prescription.mapper.PhieuKeDonMapper;
import com.kada.da.modules.prescription.repository.PhieuKeDonRepository;
import com.kada.da.modules.staff.repository.NhanSuRepository;
import com.kada.da.modules.examination.repository.HoSoThiLucRepository;
import com.kada.da.modules.inventory.repository.SanPhamRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PhieuKeDonServiceImpl implements PhieuKeDonService {

    private final PhieuKeDonRepository phieuKeDonRepository;
    private final NhanSuRepository nhanSuRepository;
    private final HoSoThiLucRepository hoSoThiLucRepository;
    private final SanPhamRepository sanPhamRepository;

    @Override
    @Transactional
    public PhieuKeDonResponseDTO taoDonThuoc(PhieuKeDonRequestDTO dto) {
        PhieuKeDon phieuKeDon = PhieuKeDonMapper.toEntity(dto);
        phieuKeDon.setMaDon(generateMaDon());
        
        phieuKeDon.setHoSoThiLuc(hoSoThiLucRepository.findById(dto.getMaHoSo())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ thị lực: " + dto.getMaHoSo())));
        
        phieuKeDon.setNhanSu(nhanSuRepository.findById(dto.getMaNs())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ: " + dto.getMaNs())));

        if (dto.getDanhSachKeDon() != null) {
            List<CtKeDon> chiTietList = dto.getDanhSachKeDon().stream().map(ctDto -> {
                CtKeDon ct = new CtKeDon();
                ct.setPhieuKeDon(phieuKeDon);
                ct.setSanPham(sanPhamRepository.findById(ctDto.getMaSp())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm " + ctDto.getMaSp())));
                ct.setSoLuong(ctDto.getSoLuong() != null ? ctDto.getSoLuong() : 1);
                ct.setLieuDung(ctDto.getLieuDung());
                ct.setCachDung(ctDto.getCachDung());
                return ct;
            }).collect(Collectors.toList());
            phieuKeDon.setChiTietKeDons(chiTietList);
        }
        
        PhieuKeDon saved = phieuKeDonRepository.save(phieuKeDon);
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

    // Hàm sinh mã tự động
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
}
