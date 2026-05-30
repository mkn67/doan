package com.kada.da.modules.examination.service;

import com.kada.da.modules.examination.domain.AuditHosoThiluc;
import com.kada.da.modules.examination.dto.AuditHosoThilucResponseDTO;
import com.kada.da.modules.examination.repository.AuditHosoThilucRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditHosoThilucServiceImpl implements AuditHosoThilucService {

    private final AuditHosoThilucRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<AuditHosoThilucResponseDTO> getByMaHoSo(String maHoSo) {
        return repository.findByMaHoSoOrderByThoiGianDesc(maHoSo)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditHosoThilucResponseDTO> getAll() {
        return repository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private AuditHosoThilucResponseDTO mapToDto(AuditHosoThiluc entity) {
        String tenKhachHang = null;
        if (entity.getHoSoThiLuc() != null && entity.getHoSoThiLuc().getKhachHang() != null) {
            tenKhachHang = entity.getHoSoThiLuc().getKhachHang().getHoTen();
        }

        return AuditHosoThilucResponseDTO.builder()
                .maAudit(entity.getMaAudit())
                .maHoSo(entity.getMaHoSo())
                .tenKhachHang(tenKhachHang)
                .nguoiThayDoi(entity.getNguoiThucHien())
                .thoiGianThayDoi(entity.getThoiGian())
                .ketLuanCu(entity.getOldKetLuan())
                .ketLuanMoi(entity.getNewKetLuan())
                .build();
    }
}
