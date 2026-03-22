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
@Table(name = "TAI_KHOAN")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaiKhoan {

    @Id
    @Column(name = "MATK", length = 10)
    private String maTk;

    @Column(name = "MANHOM", length = 10)
    private String maNhom;

    @Column(name = "USERNAME", length = 50, unique = true)
    private String username;

    @Column(name = "PASSWORD", length = 255)
    private String password;

    @Column(name = "TRANGTHAI")
    @Builder.Default
    private Integer trangThai = 1; 
}