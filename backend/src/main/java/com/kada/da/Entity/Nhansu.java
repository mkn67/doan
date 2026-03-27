package com.kada.da.Entity;
import java.time.LocalDate;

import org.hibernate.annotations.SQLRestriction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="NHAN_SU")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLRestriction("IS_DELETED = 0")
public class Nhansu {
    @Id
    @Column(name = "MANS", length = 10)
    private String maNs;

    @OneToOne
    @JoinColumn(name = "MATK", referencedColumnName = "MATK", unique = true)
    private TaiKhoan taiKhoan;

    @ManyToOne
    @JoinColumn(name = "MACV", referencedColumnName = "MACV")
    private ChucVu chucVu;

    @Column(name = "CCCD", length = 12)
    private String cccd;

    @Column(name = "HOTEN", length = 100)
    private String hoTen;

    @Column(name = "NGAYSINH")
    private LocalDate ngaySinh;

    @Column(name = "GIOITINH", length = 10)
    private String gioiTinh;

    @Column(name = "SDT", length = 15)
    private String sdt;

    @Column(name = "DIACHI", length = 255)
    private String diaChi;

    @Column(name = "CHUYENKHOA", length = 100)
    private String chuyenKhoa;

    @Column(name = "IS_DELETED")
    private Integer isDeleted;

    @PrePersist
    public void prePersist() {
        if (this.maNs == null || this.maNs.isEmpty()) {
            this.maNs = null;
        }
        if (this.isDeleted == null) {
            this.isDeleted = 0;
        }
    }
}
