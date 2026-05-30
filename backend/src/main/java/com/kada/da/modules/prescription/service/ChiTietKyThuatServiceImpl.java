package com.kada.da.modules.prescription.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kada.da.modules.prescription.domain.ChiTietKyThuat;
import com.kada.da.modules.prescription.dto.ChiTietKyThuatRequestDTO;
import com.kada.da.modules.prescription.dto.ChiTietKyThuatResponseDTO;
import com.kada.da.modules.prescription.repository.ChiTietKyThuatRepository;
import com.kada.da.modules.staff.repository.NhanSuRepository;
import com.kada.da.modules.staff.domain.NhanSu;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChiTietKyThuatServiceImpl implements ChiTietKyThuatService {

    private final ChiTietKyThuatRepository chiTietKyThuatRepository;
    private final NhanSuRepository nhanSuRepository;

    @Override
    @Transactional
    public ChiTietKyThuatResponseDTO saveKyThuat(ChiTietKyThuatRequestDTO request) {
        NhanSu nhanSu = nhanSuRepository.findById(request.getMaNs())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân sự"));

        ChiTietKyThuat entity = chiTietKyThuatRepository.findById(request.getMaNs()).orElse(new ChiTietKyThuat());
        entity.setMaNs(request.getMaNs());
        entity.setNhanSu(nhanSu);
        entity.setChuyenNganh(request.getTenKyThuat()); 
        entity.setChungChiHanhNghe(request.getTrinhDo());
        entity.setNoiCap(request.getDonViCap()); 
        entity.setGhiChu(request.getMoTaThanhTich()); 

        ChiTietKyThuat saved = chiTietKyThuatRepository.save(entity);

        ChiTietKyThuatResponseDTO response = new ChiTietKyThuatResponseDTO();
        response.setMaCtkt(saved.getMaNs());
        response.setTenNhanSu(saved.getNhanSu() != null ? saved.getNhanSu().getHoTen() : null);
        if (saved.getNhanSu() != null && saved.getNhanSu().getChucVu() != null) {
            response.setChucVu(saved.getNhanSu().getChucVu().getTenCv());
        }
        response.setTenKyThuat(saved.getChuyenNganh());
        response.setTrinhDo(saved.getChungChiHanhNghe());
        response.setDonViCap(saved.getNoiCap());
        response.setNgayCapNhat(LocalDateTime.now());
        
        return response;
    }
}
