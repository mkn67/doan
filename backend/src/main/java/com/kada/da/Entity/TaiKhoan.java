package com.kada.da.Entity;

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
@Table(name = "TAI_KHOAN")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaiKhoan {

    @Id
    @Column(name = "MATK", length = 10)
    private String maTk;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MANHOM")
    private Nhom nhom;

    @Column(name = "USERNAME", length = 50, unique = true)
    private String username;

    @Column(name = "PASSWORD", length = 255)
    private String password;

    @Column(name = "TRANGTHAI")
    private Integer trangThai; 
}