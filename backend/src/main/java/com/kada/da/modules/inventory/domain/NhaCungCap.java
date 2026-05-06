package com.kada.da.Entity;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Entity
@Table(name = "NHA_CUNG_CAP")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class NhaCungCap {

    @Id
    @Column(name = "MANCC", length = 10)
    private String maNcc;

    @Column(name = "TENNCC", length = 100)
    private String tenNcc;

    @Column(name = "SDT", length = 15)
    private String sdt;

    @Column(name = "DIACHI", length = 255)
    private String diaChi;
    @OneToMany(mappedBy = "nhaCungCap")
    private List<PhieuNhap> danhSachPhieuNhap;
}