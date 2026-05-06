package com.kada.da.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CHUC_VU")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ChucVu {
    @Id
    @Column(name = "MACV", length = 10)
    private String maCv;
    @Column(name = "TENCV", length = 100)
    private String tenCv;
}
