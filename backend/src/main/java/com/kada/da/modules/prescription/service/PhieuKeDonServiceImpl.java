package com.kada.da.modules.prescription.service;

import java.util.List;
import java.util.stream.Collectors;

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

    @Override
    @Transactional
    public PhieuKeDonResponseDTO taoDonThuoc(PhieuKeDonRequestDTO dto) {
        PhieuKeDon phieuKeDon = PhieuKeDonMapper.toEntity(dto);
        phieuKeDon.setMaDon(generateMaDon());
        
        phieuKeDon.setHoSoThiLuc(hoSoThiLucRepository.findById(dto.getMaHoSo())
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y há»“ sÆ¡ thá»‹ lá»±c: " + dto.getMaHoSo())));
        
        phieuKeDon.setNhanSu(nhanSuRepository.findById(dto.getMaNs())
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y bÃ¡c sÄ©: " + dto.getMaNs())));

        if (dto.getDanhSachKeDon() != null) {
            // Sáº¯p xáº¿p danh sÃ¡ch kÃª Ä‘Æ¡n theo mÃ£ sáº£n pháº©m tÄƒng dáº§n Ä‘á»ƒ trÃ¡nh deadlock khi khÃ³a hÃ ng loáº¡t
            List<PhieuKeDonRequestDTO.CtKeDonRequest> sortedList = dto.getDanhSachKeDon().stream()
                    .sorted((a, b) -> a.getMaSp().compareTo(b.getMaSp()))
                    .collect(Collectors.toList());

            List<CtKeDon> chiTietList = sortedList.stream().map(ctDto -> {
                CtKeDon ct = new CtKeDon();
                ct.setPhieuKeDon(phieuKeDon);
                
                // Sá»­ dá»¥ng khÃ³a bi quan (FOR UPDATE) trÃªn hÃ ng cá»§a sáº£n pháº©m cá»¥ thá»ƒ Ä‘á»ƒ Ä‘á»“ng bá»™ luá»“ng
                var sanPham = sanPhamRepository.findByIdWithWriteLock(ctDto.getMaSp())
                        .orElseThrow(() -> new BusinessRuleException("KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m " + ctDto.getMaSp()));
                ct.setSanPham(sanPham);
                
                // Khá»Ÿi táº¡o khÃ³a phá»©c táº¡p Ä‘á»ƒ trÃ¡nh lá»—i mapsId khi hibernate persist
                ct.setId(new CtKeDonId(phieuKeDon.getMaDon(), sanPham.getMaSp()));
                
                int reqQty = ctDto.getSoLuong() != null ? ctDto.getSoLuong() : 1;
                
                // Kiá»ƒm tra tá»“n kho táº¡i thá»i Ä‘iá»ƒm kÃª Ä‘Æ¡n (Tá»•ng tá»“n kho váº­t lÃ½)
                int totalStock = loHangRepository.getDanhSachLoFefo(ctDto.getMaSp()).stream()
                        .mapToInt(lh -> lh.getSoLuongTon() != null ? lh.getSoLuongTon() : 0)
                        .sum();
                
                // Láº¥y lÆ°á»£ng Ä‘Ã£ Ä‘áº·t trÆ°á»›c bá»Ÿi cÃ¡c Ä‘Æ¡n thuá»‘c chÆ°a thanh toÃ¡n/chÆ°a láº­p hÃ³a Ä‘Æ¡n khÃ¡c
                int reservedQty = ctKeDonRepository.getReservedQuantity(ctDto.getMaSp());
                int availableStock = Math.max(0, totalStock - reservedQty);
                
                if (availableStock < reqQty) {
                    throw new BusinessRuleException("Sáº£n pháº©m " + sanPham.getTenSp() 
                            + " khÃ´ng Ä‘á»§ sá»‘ lÆ°á»£ng tá»“n kho kháº£ dá»¥ng (YÃªu cáº§u: " + reqQty 
                            + ", Váº­t lÃ½: " + totalStock + ", ÄÃ£ Ä‘áº·t trÆ°á»›c: " + reservedQty 
                            + ", Kháº£ dá»¥ng: " + availableStock + ")!");
                }
                
                ct.setSoLuong(reqQty);
                ct.setLieuDung(ctDto.getLieuDung());
                ct.setCachDung(ctDto.getCachDung());
                return ct;
            }).collect(Collectors.toList());
            phieuKeDon.setChiTietKeDons(chiTietList);
        }
        
        PhieuKeDon saved = phieuKeDonRepository.save(phieuKeDon);

        // === Tá»° Äá»˜NG Táº O PHIáº¾U Xá»¬ LÃ KÃNH náº¿u Ä‘Æ¡n cÃ³ sáº£n pháº©m loáº¡i kÃ­nh (laThuoc = 0) ===
        autoCreateXuLyKinhIfNeeded(saved);

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

    // HÃ m sinh mÃ£ phiáº¿u kÃª Ä‘Æ¡n tá»± Ä‘á»™ng
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
