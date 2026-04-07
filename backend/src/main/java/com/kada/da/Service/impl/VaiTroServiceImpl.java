package com.kada.da.Service.impl;

import com.kada.da.Dto.VaiTroRequestDTO;
import com.kada.da.Dto.Response.NhomResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Dto.Response.VaiTroResponseDTO;
import com.kada.da.Entity.VaiTro;
import com.kada.da.Exception.BusinessRuleException;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.Repository.NhomRepository;
import com.kada.da.Repository.VaiTroRepository;
import com.kada.da.Service.VaiTroService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VaiTroServiceImpl implements VaiTroService {

    private final VaiTroRepository vaiTroRepository;
    private final NhomRepository nhomRepository;

    @Override
    @Transactional
    public VaiTroResponseDTO createVaiTro(VaiTroRequestDTO request) {
        if (vaiTroRepository.existsById(request.getMaVaiTro())) {
            throw new BusinessRuleException("Mã vai trò đã tồn tại!");
        }

        VaiTro vaiTro = VaiTro.builder()
                .maVaiTro(request.getMaVaiTro().toUpperCase())
                .tenVaiTro(request.getTenVaiTro())
                .moTa(request.getMoTa())
                .build();

        return convertToResponse(vaiTroRepository.save(vaiTro));
    }

    @Override
    public VaiTroResponseDTO getVaiTroById(String maVaiTro) {
        return convertToResponse(findById(maVaiTro));
    }

    @Override
    public PageResponseDTO<VaiTroResponseDTO> getAllVaiTro(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VaiTro> pageData = vaiTroRepository.findAll(pageable);

        return PageResponseDTO.<VaiTroResponseDTO>builder()
                .content(pageData.getContent().stream().map(this::convertToResponse).collect(Collectors.toList()))
                .pageNo(page)
                .pageSize(size)
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .last(pageData.isLast())
                .build();
    }

    @Override
    public List<VaiTroResponseDTO> getAllVaiTroList() {
        return vaiTroRepository.findAll().stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public List<NhomResponseDTO> getNhomByVaiTro(String maVaiTro) {
        // Tùy theo cách map entity, giả sử NhomRepository có hàm tìm nhóm theo vai trò
        return nhomRepository.findByVaiTros_MaVaiTro(maVaiTro).stream()
                .map(nhom -> NhomResponseDTO.builder().maNhom(nhom.getMaNhom()).tenNhom(nhom.getTenNhom()).build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VaiTroResponseDTO updateVaiTro(String maVaiTro, VaiTroRequestDTO request) {
        VaiTro vaiTro = findById(maVaiTro);
        vaiTro.setTenVaiTro(request.getTenVaiTro());
        vaiTro.setMoTa(request.getMoTa());
        return convertToResponse(vaiTroRepository.save(vaiTro));
    }

    @Override
    @Transactional
    public void deleteVaiTro(String maVaiTro) {
        vaiTroRepository.delete(findById(maVaiTro));
    }

    @Override
    public List<VaiTroResponseDTO> searchVaiTroByTen(String keyword) {
        return vaiTroRepository.findByTenVaiTroContainingIgnoreCase(keyword).stream()
                .map(this::convertToResponse).collect(Collectors.toList());
    }

    private VaiTro findById(String maVaiTro) {
        return vaiTroRepository.findById(maVaiTro)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vai trò: " + maVaiTro));
    }

    private VaiTroResponseDTO convertToResponse(VaiTro entity) {
        return VaiTroResponseDTO.builder()
                .maVaiTro(entity.getMaVaiTro())
                .tenVaiTro(entity.getTenVaiTro())
                .moTa(entity.getMoTa())
                .build();
    }
}