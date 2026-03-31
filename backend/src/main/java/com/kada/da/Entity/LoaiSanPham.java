package com.kada.da.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "LOAI_SAN_PHAM")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoaiSanPham {

    @Id
    @Column(name = "MALOAI", length = 10)
    private String maLoai;

    @Column(name = "TENLOAI", length = 100)
    private String tenLoai;

}
