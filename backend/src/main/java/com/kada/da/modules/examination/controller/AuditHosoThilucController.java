package com.kada.da.modules.examination.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.modules.examination.dto.AuditHosoThilucResponseDTO;
import com.kada.da.modules.examination.service.AuditHosoThilucService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/audit/hoso")
@RequiredArgsConstructor
public class AuditHosoThilucController {

    private final AuditHosoThilucService auditService;

    @GetMapping("/{maHoSo}")
    public ResponseEntity<List<AuditHosoThilucResponseDTO>> getAuditByMaHoSo(
            @PathVariable String maHoSo) {
        return ResponseEntity.ok(auditService.getByMaHoSo(maHoSo));
    }

    @GetMapping
    public ResponseEntity<List<AuditHosoThilucResponseDTO>> getAllAudit() {
        return ResponseEntity.ok(auditService.getAll());
    }
}
