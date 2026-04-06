package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "LICH_LAM_VIEC")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichLamViec {
    @Id
    @Column(name = "MALLV", length = 10)
    private String maLlv;

    @Column(name = "NGAY_LAM_VIEC")
    private LocalDate ngayLamViec;

    @Column(name = "CA", length = 20)
    private String ca; // Sáng, Chiều, Tối

    @ManyToOne
    @JoinColumn(name = "MANS")
    private NhanSu nhanSu;
}