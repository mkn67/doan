package com.kada.da.modules.examination.service;

import java.util.List;

import com.kada.da.modules.examination.dto.AuditHosoThilucResponseDTO;

public interface AuditHosoThilucService {
    List<AuditHosoThilucResponseDTO> getByMaHoSo(String maHoSo);
    List<AuditHosoThilucResponseDTO> getAll();
}
