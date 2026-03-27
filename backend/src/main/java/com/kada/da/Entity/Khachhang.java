package com.kada.da.Entity;
import java.time.LocalDate;

import org.hibernate.annotations.SQLRestriction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Entity
@Table(name="KHACH_HANG")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLRestriction("IS_DELETED = 0")
public class Khachhang {
    @Id
    @Column(name = "MAKH",length=10)
    private String maKh;
    @Column(name = "CCCD",length=12)
    private String cccd;
    @Column(name="HOTEN",length =100)
    private String hoTen;
    @Column(name="NGAYSINH")
    private LocalDate ngaySinh;
    @Column(name = "GIOITINH",length = 10)
    private String gioiTinh;
    @Column(name = "SDT", length = 15, unique = true)
    private String sdt;
    @Column(name = "DIACHI", length = 255)
    private String diaChi;
    @Column(name = "DIEMTICHLUY")
    private Integer diemTichLuy;
    @Column(name = "IS_DELETED")
    private Integer isDeleted;
    @PrePersist
    public void prePersist() {
        // Trigger DB sẽ tự sinh ID, nhưng để chắc chắn JPA không báo lỗi null id
        if (this.maKh == null || this.maKh.isEmpty()) {
            this.maKh = null; 
        }
        if (this.isDeleted == null) {
            this.isDeleted = 0; // Mặc định là 0 khi tạo mới
        }
        if (this.diemTichLuy == null) {
            this.diemTichLuy = 0;
        }
    }
}
