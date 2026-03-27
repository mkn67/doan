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
@Table(name = "CHUC_VU")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChucVu {

    @Id
    @Column(name = "MACV", length = 10)
    private String maCv;

    @Column(name = "TENCV", length = 100)
    private String tenCv;
}