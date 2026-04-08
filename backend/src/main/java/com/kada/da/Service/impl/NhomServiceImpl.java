package com.kada.da.Service.impl;

import com.kada.da.Entity.TaiKhoan;
import com.kada.da.Dto.NhomRequestDTO;
import com.kada.da.Dto.Response.NhomResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Dto.Response.VaiTroResponseDTO;
import com.kada.da.Entity.Nhom;
import com.kada.da.Entity.VaiTro;
import com.kada.da.Entity.NhanSu;
import com.kada.da.Exception.BusinessRuleException;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.Repository.NhomRepository;
import com.kada.da.Repository.VaiTroRepository;
import com.kada.da.Repository.NhanSuRepository;
import com.kada.da.Repository.TaiKhoanRepository;
import com.kada.da.Service.NhomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NhomServiceImpl implements NhomService {

    private final NhomRepository nhomRepository;
    private final VaiTroRepository vaiTroRepository;
    private final NhanSuRepository nhanSuRepository;
    private final TaiKhoanRepository taiKhoanRepository;

    @Override
    @Transactional
    public NhomResponseDTO createNhom(NhomRequestDTO request) {
        if (nhomRepository.existsByTenNhom(request.getTenNhom())) {
            throw new BusinessRuleException("Tên nhóm đã tồn tại");
        }

        Nhom nhom = Nhom.builder()
                .maNhom("NH" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .tenNhom(request.getTenNhom())
                .vaiTros(new ArrayList<>())
                .moTa(request.getMoTa())
                .build();

        return convertToResponse(nhomRepository.save(nhom));
    }

    @Override
    public NhomResponseDTO getNhomById(String maNhom) {
        return convertToResponse(findById(maNhom));
    }

    @Override
    public PageResponseDTO<NhomResponseDTO> getAllNhom(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Nhom> pageData = nhomRepository.findAll(pageable);

        return PageResponseDTO.<NhomResponseDTO>builder()
                .content(pageData.getContent().stream().map(this::convertToResponse).collect(Collectors.toList()))
                .pageNo(page)
                .pageSize(size)
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .last(pageData.isLast())
                .build();
    }

    @Override
    public List<NhomResponseDTO> getAllNhomList() {
        return nhomRepository.findAll().stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public List<VaiTroResponseDTO> getVaiTroByNhom(String maNhom) {
        Nhom nhom = findById(maNhom);
        return nhom.getVaiTros().stream()
                .map(vt -> VaiTroResponseDTO.builder().maVaiTro(vt.getMaVaiTro()).tenVaiTro(vt.getTenVaiTro()).build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public NhomResponseDTO updateNhom(String maNhom, NhomRequestDTO request) {
        Nhom nhom = findById(maNhom);
        nhom.setTenNhom(request.getTenNhom());
        nhom.setMoTa(request.getMoTa());
        return convertToResponse(nhomRepository.save(nhom));
    }

    @Override
    @Transactional
    public void deleteNhom(String maNhom) {
        nhomRepository.delete(findById(maNhom));
    }

    @Override
    @Transactional
    public void addVaiTroToNhom(String maNhom, String maVaiTro) {
        Nhom nhom = findById(maNhom);
        VaiTro vaiTro = vaiTroRepository.findById(maVaiTro)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vai trò"));

        if (!nhom.getVaiTros().contains(vaiTro)) {
            nhom.getVaiTros().add(vaiTro);
            nhomRepository.save(nhom);
        }
    }

    @Override
    @Transactional
    public void removeVaiTroFromNhom(String maNhom, String maVaiTro) {
        Nhom nhom = findById(maNhom);
        VaiTro vaiTro = vaiTroRepository.findById(maVaiTro)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vai trò"));

        if (nhom.getVaiTros().contains(vaiTro)) {
            nhom.getVaiTros().remove(vaiTro);
            nhomRepository.save(nhom);
        }
    }

    // ==================== PHÂN QUYỀN NHÂN SỰ - NHÓM ====================

    @Override
    @Transactional
    public void assignNhanSuToNhom(String maNhom, List<String> maNsList) {
        Nhom nhom = findById(maNhom);
        for (String maNs : maNsList) {
            NhanSu nhanSu = nhanSuRepository.findById(maNs)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân sự: " + maNs));
            TaiKhoan taiKhoan = nhanSu.getTaiKhoan();
            if (taiKhoan == null) {
                throw new BusinessRuleException("Nhân sự " + maNs + " chưa có tài khoản hệ thống!");
            }
            // Chỉ thêm nếu chưa có nhóm này
            if (!taiKhoan.getDanhSachNhom().contains(nhom)) {
                taiKhoan.getDanhSachNhom().add(nhom);
                taiKhoanRepository.save(taiKhoan);
                log.info("Đã gán nhóm {} cho tài khoản của nhân sự {}", maNhom, maNs);
            } else {
                log.warn("Nhân sự {} đã có nhóm {} rồi, bỏ qua", maNs, maNhom);
            }
        }
    }

    @Override
    @Transactional
    public void addNhanSuToNhom(String maNs, String maNhom) {
        assignNhanSuToNhom(maNhom, List.of(maNs));
    }

    // ==================== PRIVATE METHODS ====================

    private Nhom findById(String maNhom) {
        return nhomRepository.findById(maNhom)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhóm: " + maNhom));
    }

    private NhomResponseDTO convertToResponse(Nhom entity) {
        return NhomResponseDTO.builder()
                .maNhom(entity.getMaNhom())
                .tenNhom(entity.getTenNhom())
                .moTa(entity.getMoTa())
                .build();
    }
}