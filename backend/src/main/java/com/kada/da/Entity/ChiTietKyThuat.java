package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CHI_TIET_KY_THUAT")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietKyThuat {
    @Id
    @Column(name = "MACTKT", length = 10)
    private String maCtkt;

    @Column(name = "TEN_THONG_SO", length = 100)
    private String tenThongSo; // Ví dụ: Chiết suất (Index), Lớp phủ (Coating)

    @Column(name = "GIA_TRI", length = 255)
    private String giaTri; // Ví dụ: 1.67, Blue Control

    @ManyToOne
    @JoinColumn(name = "MAXLK")
    private XuLyKinh xuLyKinh;
}