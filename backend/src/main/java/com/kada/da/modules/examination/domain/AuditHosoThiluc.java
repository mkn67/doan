package com.kada.da.modules.examination.domain;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "AUDIT_HOSO_THILUC")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditHosoThiluc {

    @Id
    @Column(name = "MAAUDIT", length = 20)
    private String maAudit;

    @Column(name = "MAHOSO", length = 10)
    private String maHoSo;

    @Column(name = "OLD_KETLUAN", length = 255)
    private String oldKetLuan;

    @Column(name = "NEW_KETLUAN", length = 255)
    private String newKetLuan;

    @Column(name = "THOI_GIAN")
    private LocalDateTime thoiGian;

    @Column(name = "NGUOI_THUC_HIEN", length = 50)
    private String nguoiThucHien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MAHOSO", insertable = false, updatable = false)
    @JsonIgnore
    private HoSoThiLuc hoSoThiLuc;
}
