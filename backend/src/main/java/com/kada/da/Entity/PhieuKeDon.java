package com.kada.da.Entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "PHIEU_KE_DON")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PhieuKeDon {
    @Id
    @Column(name = "MADON", length = 10)
    private String maDon;
    @Column(name = "NGAYKEDON")
    private LocalDate ngayKeDon;
    @Column(name = "LOIDAN", length = 255)
    private String loiDan;
    @ManyToOne
    @JoinColumn(name = "MAHOSO")
    private HoSoThiLuc hoSoThiLuc;
    @ManyToOne
    @JoinColumn(name = "MANS")
    private NhanSu nhanSu;
}